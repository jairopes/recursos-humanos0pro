
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import PayrollConfig from './pages/PayrollConfig';
import MonthlyLaunches from './pages/MonthlyLaunches';
import Advances from './pages/Advances';
import SalaryEvolution from './pages/SalaryEvolution';
import Login from './pages/Login';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem('rh_auth_session');
    const storedName = localStorage.getItem('rh_user_name');
    if (session) {
      setIsAuthenticated(true);
      if (storedName) setUserName(storedName);
    }
    setLoading(false);
  }, []);

  const handleLogin = (name: string) => {
    localStorage.setItem('rh_auth_session', 'true');
    localStorage.setItem('rh_user_name', name);
    setUserName(name);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('rh_auth_session');
    localStorage.removeItem('rh_user_name');
    setIsAuthenticated(false);
    setUserName('');
    setActiveTab('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'employees': return <Employees />;
      case 'payroll_config': return <PayrollConfig />;
      case 'launches': return <MonthlyLaunches />;
      case 'advances': return <Advances />;
      case 'salary_evolution': return <SalaryEvolution />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={setActiveTab} 
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
