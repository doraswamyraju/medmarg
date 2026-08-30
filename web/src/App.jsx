import React, { useState } from 'react';
import LoginPage, { DEMO_ACCOUNTS } from './pages/LoginPage';
import PatientDashboard from './pages/PatientDashboard';
import LabPartnerDashboard from './pages/LabPartnerDashboard';
import ScanCenterDashboard from './pages/ScanCenterDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import PharmacyDashboard from './pages/PharmacyDashboard';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);

  const handleLoginSuccess = (userProfile) => {
    setCurrentUser(userProfile);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleSwitchRole = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Render dedicated dashboard based on detected user role
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
