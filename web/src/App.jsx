import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import LoginPage, { DEMO_ACCOUNTS } from './pages/LoginPage';
import PatientDashboard from './pages/PatientDashboard';
import LabPartnerDashboard from './pages/LabPartnerDashboard';
import ScanCenterDashboard from './pages/ScanCenterDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import PharmacyDashboard from './pages/PharmacyDashboard';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState(() => {
    return window.location.pathname.includes('/login') ? 'LOGIN' : 'LANDING';
  });

  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname.includes('/login')) {
        setCurrentView('LOGIN');
      } else if (!currentUser) {
        setCurrentView('LANDING');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentUser]);

  const navigateToLogin = (roleHint) => {
    window.history.pushState({}, '', '/login');
    if (roleHint) {
      const match = DEMO_ACCOUNTS.find(a => a.role === roleHint);
      if (match) {
        setCurrentUser(match);
        return;
      }
    }
    setCurrentView('LOGIN');
  };

  const navigateToHome = () => {
    window.history.pushState({}, '', '/');
    setCurrentUser(null);
    setCurrentView('LANDING');
  };

  const handleLoginSuccess = (userProfile) => {
    setCurrentUser(userProfile);
  };

  const handleLogout = () => {
    navigateToHome();
  };

  const handleSwitchRole = () => {
    navigateToLogin();
  };

  // If user is logged in, show their dedicated role dashboard
  if (currentUser) {
    switch (currentUser.role) {
      case 'DIAGNOSTIC_LAB':
        return <LabPartnerDashboard user={currentUser} onSwitchRole={handleSwitchRole} onLogout={handleLogout} />;
      case 'SCAN_CENTER':
        return <ScanCenterDashboard user={currentUser} onSwitchRole={handleSwitchRole} onLogout={handleLogout} />;
      case 'DOCTOR':
        return <DoctorDashboard user={currentUser} onSwitchRole={handleSwitchRole} onLogout={handleLogout} />;
      case 'PHARMACY':
        return <PharmacyDashboard user={currentUser} onSwitchRole={handleSwitchRole} onLogout={handleLogout} />;
      case 'ADMIN':
        return <AdminDashboard user={currentUser} onSwitchRole={handleSwitchRole} onLogout={handleLogout} />;
      case 'PATIENT':
      default:
        return <PatientDashboard user={currentUser} onSwitchRole={handleSwitchRole} onLogout={handleLogout} />;
    }
  }

  // If view is LOGIN, show Single Universal Login page
  if (currentView === 'LOGIN') {
    return <LoginPage onLoginSuccess={handleLoginSuccess} onBackToHome={navigateToHome} />;
  }

  // Otherwise, render the complete MedMarg Landing Page
  return <LandingPage onNavigateLogin={navigateToLogin} />;
}
