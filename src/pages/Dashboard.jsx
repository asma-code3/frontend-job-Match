import React from 'react';
import { useAuth } from '../context/AuthContext';
import SeekerDashboard from './SeekerDashboard';
import EmployerDashboard from './EmployerDashboard';
import AdminDashboard from './AdminDashboard';


const Dashboard = () => {
  const { user } = useAuth();

  if (!user) return <div className="p-10">Loading...</div>;

  switch (user.role) {
    case 'employer':
      return <EmployerDashboard />;
    case 'admin':
      return <AdminDashboard />;
    case 'seeker':
    default:
      return <SeekerDashboard />;
  }
};

export default Dashboard;
