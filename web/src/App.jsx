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
import FreelanceSignupPage from './pages/FreelanceSignupPage';
import PartnerSignupPage from './pages/PartnerSignupPage';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('medmarg_user');
      let parsed = saved ? JSON.parse(saved) : null;
      if (parsed) {
        const emailKey = (parsed.email || 'patient').toLowerCase().replace(/[^a-z0-9]/g, '_');
        const storedPhone = localStorage.getItem(`medmarg_phone_${emailKey}`) || localStorage.getItem('medmarg_user_phone');
        if (storedPhone && storedPhone.replace(/[^0-9]/g, '').length >= 10) {
          parsed.phone = storedPhone;
          parsed.identifier = storedPhone;
        }
      }
      return parsed;
    } catch (e) {
      return null;
    }
  });
  const [currentView, setCurrentView] = useState(() => {
    const p = window.location.pathname.toLowerCase();
    if (p.includes('/signup-freelance') || p.includes('/join-phlebo')) return 'FREELANCER_SIGNUP';
    if (p.includes('/signup-partner') || p.includes('/partner-register')) return 'PARTNER_SIGNUP';
    if (p.includes('/login')) return 'LOGIN';
    return 'LANDING';
  });

  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname.toLowerCase();
      if (p.includes('/signup-freelance') || p.includes('/join-phlebo')) {
        setCurrentView('FREELANCER_SIGNUP');
      } else if (p.includes('/signup-partner') || p.includes('/partner-register')) {
        setCurrentView('PARTNER_SIGNUP');
      } else if (p.includes('/login')) {
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

  const navigateToFreelancerSignup = () => {
    window.history.pushState({}, '', '/signup-freelancer');
    setCurrentView('FREELANCER_SIGNUP');
  };

  const navigateToPartnerSignup = () => {
    window.history.pushState({}, '', '/signup-partner');
    setCurrentView('PARTNER_SIGNUP');
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
      case 'FREELANCE_AGENT':
      case 'FREELANCE':
      case 'FREELANCER':
      case 'GIG_AGENT':
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

  // 2. Freelancer Agent Signup
  if (currentView === 'FREELANCER_SIGNUP') {
    return (
      <FreelanceSignupPage 
        onNavigateLogin={navigateToLogin} 
        onNavigateHome={navigateToHome} 
      />
    );
  }

  // 3. Healthcare Partner Pre-Registration
  if (currentView === 'PARTNER_SIGNUP') {
    return (
      <PartnerSignupPage 
        onNavigateLogin={navigateToLogin} 
        onNavigateHome={navigateToHome} 
      />
    );
  }

  // 4. If at /login or view is LOGIN, render the Login Module
  if (currentView === 'LOGIN' || window.location.pathname.includes('/login')) {
    return (
      <LoginPage 
        onLoginSuccess={handleLoginSuccess} 
        onBackToHome={navigateToHome}
        onNavigateFreelancerSignup={navigateToFreelancerSignup}
        onNavigatePartnerSignup={navigateToPartnerSignup}
      />
    );
  }

  // 5. Otherwise, render the complete MedMarg Landing Page
  return (
    <LandingPage 
      onNavigateLogin={navigateToLogin} 
      onNavigateFreelancerSignup={navigateToFreelancerSignup}
      onNavigatePartnerSignup={navigateToPartnerSignup}
    />
  );
}
