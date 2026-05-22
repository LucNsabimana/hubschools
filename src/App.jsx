import React, { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import TopNav from './components/TopNav';
import HomePage from './pages/HomePage';
import OverviewTab from './pages/OverviewTab';
import DataTab from './pages/DataTab';
import PartnersTab from './pages/PartnersTab';
import SelfAssessTab from './pages/SelfAssessTab';
import KPITab from './pages/KPITab';
import SystemTab from './pages/SystemTab';

function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [selectedSchool, setSelectedSchool] = useState(user?.schoolId || 'mather');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'system') setSelectedSchool('all');
  };

  const handleSchoolChange = (schoolId) => {
    setSelectedSchool(schoolId);
    if (schoolId !== 'all' && activeTab === 'system') setActiveTab('overview');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        selectedSchool={selectedSchool}
        onSchoolChange={handleSchoolChange}
      />
      <div style={{ flex: 1, background: '#0f1623', padding: '20px', overflowY: 'auto' }}>
        {activeTab === 'home'       && <HomePage onNavigate={handleTabChange} />}
        {activeTab === 'system'     && <SystemTab />}
        {activeTab === 'overview'   && <OverviewTab schoolId={selectedSchool} />}
        {activeTab === 'data'       && <DataTab schoolId={selectedSchool} />}
        {activeTab === 'partners'   && <PartnersTab schoolId={selectedSchool} />}
        {activeTab === 'selfassess' && <SelfAssessTab schoolId={selectedSchool} />}
        {activeTab === 'kpi'        && <KPITab schoolId={selectedSchool} />}
      </div>
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b8885', fontSize: 13 }}>Loading…</div>;
  return user ? <Dashboard /> : <LoginPage />;
}

export default function App() {
  return <AuthProvider><AppContent /></AuthProvider>;
}
