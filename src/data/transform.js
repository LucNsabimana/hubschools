// Turns the spreadsheet tabs (arrays of row objects keyed by header) into the
// shapes the pages use. Kept free of React so it can be tested on its own.

const blank = v => v === '' || v === null || v === undefined;
const num = v => (blank(v) ? null : (typeof v === 'number' ? v : (Number.isFinite(Number(v)) ? Number(v) : null)));
const str = v => (blank(v) ? '' : String(v));
const bool = v => v === true || /^(true|yes|y|1|active)$/i.test(String(v ?? '').trim());
const groupBy = (rows, key = 'SchoolId') => rows.reduce((acc, r) => {
  const k = str(r[key]);
  if (!k) return acc;
  (acc[k] = acc[k] || []).push(r);
  return acc;
}, {});

// Metrics tab column -> key used by the pages
export const METRIC_COLUMNS = {
  Enrollment: 'enroll',
  AvgDailyAttendance: 'ada',
  ChronicAbsenteeism: 'ca',
  OnTrack: 'aot',
  Belonging: 'bel',
  Safety: 'saf',
  EconDisadvantaged: 'eco',
  MultilingualLearners: 'ml',
  StudentsWithDisabilities: 'swd',
};

const NUM_YEARS = 3; // the pages show three years side by side

export function buildData(tabs) {
  const t = name => tabs[name] || [];

  // Years: the last three listed, oldest first
  const allYears = t('Years').map(r => str(r.Year)).filter(Boolean);
  const YEARS = allYears.slice(-NUM_YEARS);
  const yearIdx = Object.fromEntries(YEARS.map((y, i) => [y, i]));
  const series = () => Array(YEARS.length).fill(null);

  const settings = Object.fromEntries(t('Settings').map(r => [str(r.Key), str(r.Value)]));

  const schoolRows = t('Schools').filter(r => str(r.SchoolId));
  const SCHOOLS = schoolRows.map(r => ({
    id: str(r.SchoolId), name: str(r.Name), short: str(r.Short) || str(r.Name),
  }));
  const nameOf = Object.fromEntries(SCHOOLS.map(s => [s.id, s.name]));

  // System-wide metrics
  const metricsBySchool = groupBy(t('Metrics'));
  const SYSTEM_DATA = SCHOOLS.map(s => {
    const o = { id: s.id, name: s.name };
    Object.values(METRIC_COLUMNS).forEach(k => { o[k] = series(); });
    (metricsBySchool[s.id] || []).forEach(r => {
      const i = yearIdx[str(r.Year)];
      if (i === undefined) return;
      Object.entries(METRIC_COLUMNS).forEach(([col, k]) => { o[k][i] = num(r[col]); });
    });
    return o;
  });

  // Detail metrics (subgroups, demographics). Metric names starting with demo_ go under demographics.
  const DETAIL_DATA = {};
  t('DetailMetrics').forEach(r => {
    const sid = str(r.SchoolId), metric = str(r.Metric), i = yearIdx[str(r.Year)];
    if (!sid || !metric || i === undefined) return;
    const d = DETAIL_DATA[sid] = DETAIL_DATA[sid] || { demographics: {} };
    const target = metric.startsWith('demo_') ? d.demographics : d;
    const key = metric.startsWith('demo_') ? metric.slice(5) : metric;
    (target[key] = target[key] || series())[i] = num(r.Value);
  });

  // Overviews
  const team = groupBy(t('AOATeam'));
  const qsp = groupBy(t('QSPGoals'));
  const leaders = groupBy(t('LeadershipTeams'));
  const SCHOOL_OVERVIEWS = {};
  schoolRows.forEach(r => {
    const sid = str(r.SchoolId);
    const ov = {
      name: str(r.FullName) || str(r.Name),
      grades: str(r.Grades),
      address: str(r.Address),
      leadPartner: str(r.LeadPartner),
      coordinator: str(r.Coordinator),
      schoolLeader: str(r.SchoolLeader),
      types: str(r.Types).split(/[;\n]/).map(x => x.trim()).filter(Boolean),
      aoa_team: (team[sid] || []).map(m => ({
        first: str(m.First), last: str(m.Last), role: str(m.Role), email: str(m.Email), pronouns: str(m.Pronouns),
      })),
    };
    if (qsp[sid]) ov.qspGoals = qsp[sid].map(g => str(g.Goal)).filter(Boolean);
    if (leaders[sid]) ov.teams = leaders[sid].map(x => ({ name: str(x.Team), active: bool(x.Active) }));
    SCHOOL_OVERVIEWS[sid] = ov;
  });

  // Self-assessments
  const SCHOOL_SELF_ASSESSMENTS = {};
  t('SelfAssessment').forEach(r => {
    const sid = str(r.SchoolId), sec = str(r.Section);
    if (!sid || !sec) return;
    const sa = SCHOOL_SELF_ASSESSMENTS[sid] = SCHOOL_SELF_ASSESSMENTS[sid] || { whodrives: [], enabling: [], keypractices: [] };
    const item = { area: str(r.Area), rating: str(r.Rating) || null };
    if (str(r.Notes)) item.notes = str(r.Notes);
    (sa[sec] = sa[sec] || []).push(item);
  });

  // Partners
  const SCHOOL_PARTNERS = {};
  t('Partners').forEach(r => {
    const sid = str(r.SchoolId);
    if (!sid) return;
    (SCHOOL_PARTNERS[sid] = SCHOOL_PARTNERS[sid] || []).push({
      name: str(r.Name), type: str(r.Type), focus: str(r.Focus), practice: str(r.Practice),
      boy: str(r.BOY), mid: str(r.MidYear), progress: str(r.Progress),
    });
  });

  // ROI (in-kind donations and grants)
  const ROI_DATA = {};
  const roi = sid => (ROI_DATA[sid] = ROI_DATA[sid] || { inkind: [], grants: [] });
  t('InKind').forEach(r => {
    const sid = str(r.SchoolId);
    if (sid) roi(sid).inkind.push({ donor: str(r.Donor), purpose: str(r.Purpose), value: num(r.Value) || 0 });
  });
  t('Grants').forEach(r => {
    const sid = str(r.SchoolId);
    if (sid) roi(sid).grants.push({ name: str(r.Name), purpose: str(r.Purpose), requested: num(r.Requested), awarded: num(r.Awarded) });
  });

  // KPIs
  const SCHOOL_KPIS = {};
  t('KPIs').forEach((r, i) => {
    const sid = str(r.SchoolId);
    if (!sid) return;
    (SCHOOL_KPIS[sid] = SCHOOL_KPIS[sid] || []).push({
      id: str(r.KpiId) || `${sid}-kpi-row${i + 2}`,
      longTermGoal: str(r.LongTermGoal), intervention: str(r.Intervention), goalDate: str(r.GoalDate),
      midpoint: str(r.Midpoint), status: str(r.Status) || 'Not Started', pct: num(r.PctComplete) || 0,
      endline: str(r.Endline),
    });
  });

  return {
    YEARS, SCHOOLS, SYSTEM_DATA, DETAIL_DATA, SCHOOL_OVERVIEWS, SCHOOL_SELF_ASSESSMENTS,
    SCHOOL_PARTNERS, ROI_DATA, SCHOOL_KPIS, settings, nameOf,
  };
}
