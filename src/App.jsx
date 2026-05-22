import React, { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { useFontSize } from './components/FontSizeControl';
import LoginPage from './pages/LoginPage';
import TopNav from './components/TopNav';
import OverviewTab from './pages/OverviewTab';
import DataTab from './pages/DataTab';
import PartnersTab from './pages/PartnersTab';
import SelfAssessTab from './pages/SelfAssessTab';
import KPITab from './pages/KPITab';
import SystemTab from './pages/SystemTab';

function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSchool, setSelectedSchool] = useState(user?.schoolId || 'mather');
  const { size: fontSize, setSize: setFontSize } = useFontSize();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'system') setSelectedSchool('all');
  };

  const handleSchoolChange = (schoolId) => {
    setSelectedSchool(schoolId);
    if (schoolId !== 'all') setActiveTab('overview');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontSize: `var(--base-font-size, 13px)` }}>
      <TopNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        selectedSchool={selectedSchool}
        onSchoolChange={handleSchoolChange}
        fontSize={fontSize}
        setFontSize={setFontSize}
      />
      <div style={{ flex: 1, background: 'var(--surface)', padding: '16px', overflowY: 'auto' }}>
        {activeTab === 'overview'   && <OverviewTab schoolId={selectedSchool} />}
        {activeTab === 'data'       && <DataTab schoolId={selectedSchool} />}
        {activeTab === 'partners'   && <PartnersTab schoolId={selectedSchool} />}
        {activeTab === 'selfassess' && <SelfAssessTab schoolId={selectedSchool} />}
        {activeTab === 'kpi'        && <KPITab schoolId={selectedSchool} />}
        {activeTab === 'system'     && <SystemTab />}
      </div>
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Loading…</div>;
  return user ? <Dashboard /> : <LoginPage />;
}

export default function App() {
  return <AuthProvider><AppContent /></AuthProvider>;
}
