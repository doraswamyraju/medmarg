import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import PatientDashboard from './pages/PatientDashboard';
import LabPartnerDashboard from './pages/LabPartnerDashboard';
import ScanCenterDashboard from './pages/ScanCenterDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import PharmacyDashboard from './pages/PharmacyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import PhlebotomistDashboard from './pages/PhlebotomistDashboard';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('medmarg_user');
      let parsed = saved ? JSON.parse(saved) : null;
      if (parsed && typeof parsed.phone === 'string' && (parsed.phone.includes('83745 42478') || parsed.phone.includes('8374542478'))) {
        parsed.phone = '+91 79979 91101';
        parsed.identifier = '+91 79979 91101';
        try { localStorage.setItem('medmarg_user', JSON.stringify(parsed)); } catch (e) {}
      }
      return parsed;
    } catch (e) {
      return null;
    }
  });
  const [currentView, setCurrentView] = useState(() => {
    return window.location.pathname.includes('/login') ? 'LOGIN' : 'LANDING';
  });

  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname.includes('/login')) {
        if (!currentUser) setCurrentView('LOGIN');
      } else if (!currentUser) {
        setCurrentView('LANDING');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentUser]);

  const navigateToLogin = () => {
    window.history.pushState({}, '', '/login');
    setCurrentView('LOGIN');
  };

  const navigateToHome = () => {
    window.history.pushState({}, '', '/');
    setCurrentView('LANDING');
  };

  const handleLoginSuccess = (userProfile) => {
    setCurrentUser(userProfile);
    try {
      localStorage.setItem('medmarg_user', JSON.stringify(userProfile));
    } catch (e) {}
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('medmarg_user');
    } catch (e) {}
    setCurrentUser(null);
    navigateToLogin();
  };

  const handleSwitchRole = () => {
    try {
      localStorage.removeItem('medmarg_user');
    } catch (e) {}
    setCurrentUser(null);
    navigateToLogin();
  };

  // 1. If user has authenticated, route directly to their specific role dashboard
  if (currentUser) {
    switch (currentUser.role) {
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return <AdminDashboard user={currentUser} onSwitchRole={handleSwitchRole} onLogout={handleLogout} />;
      
      case 'STAFF':
      case 'MEDMARG_STAFF':
        return <StaffDashboard user={currentUser} onSwitchRole={handleSwitchRole} onLogout={handleLogout} />;
      
      case 'FREELANCER_AGENT':
        return <PhlebotomistDashboard user={currentUser} agentType="FREELANCE" onSwitchRole={handleSwitchRole} onLogout={handleLogout} />;
      
      case 'SALARIED_AGENT':
      case 'COLLECTION_AGENT':
      case 'AGENT':
        return <PhlebotomistDashboard user={currentUser} agentType="SALARIED" onSwitchRole={handleSwitchRole} onLogout={handleLogout} />;
      
      case 'DIAGNOSTIC_LAB':
        return <LabPartnerDashboard user={currentUser} onSwitchRole={handleSwitchRole} onLogout={handleLogout} />;
      
      case 'SCAN_CENTER':
        return <ScanCenterDashboard user={currentUser} onSwitchRole={handleSwitchRole} onLogout={handleLogout} />;
      
      case 'DOCTOR':
        return <DoctorDashboard user={currentUser} onSwitchRole={handleSwitchRole} onLogout={handleLogout} />;
      
      case 'PHARMACY':
        return <PharmacyDashboard user={currentUser} onSwitchRole={handleSwitchRole} onLogout={handleLogout} />;
      
      case 'PATIENT':
      case 'CUSTOMER':
      default:
        return <PatientDashboard user={currentUser} onSwitchRole={handleSwitchRole} onLogout={handleLogout} />;
    }
  }

  // 2. If at /login or view is LOGIN, render the Login Module
  if (currentView === 'LOGIN' || window.location.pathname.includes('/login')) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} onBackToHome={navigateToHome} />;
  }

  // 3. Otherwise, render the complete MedMarg Landing Page
  return <LandingPage onNavigateLogin={navigateToLogin} />;
}
