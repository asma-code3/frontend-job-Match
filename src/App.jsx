import React from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Dashboard from './pages/Dashboard';
import FindJobs from './pages/FindJobs';
import MyApplications from './pages/MyApplications';
import MyProfile from './pages/MyProfile';
import PostJob from './pages/PostJob';
import ManageJobs from './pages/ManageJobs';
import Applicants from './pages/Applicants';
import ApplicantProfile from './pages/ApplicantProfile';
import CompanySettings from './pages/CompanySettings';
import Jobs from './pages/Jobs';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Register from './pages/Register';
import JobDetails from './pages/jobDetails';
import AdminDashboard from './pages/AdminDashboard';

const AuthLayout = () => {
  const location = useLocation();
  const showFooter = !['/login', '/register', '/forgot-password'].includes(location.pathname);

  return (
    <div className="app-shell min-h-screen flex flex-col">
      <main className="flex-1">
        <Outlet />
      </main>
      {showFooter ? <Footer /> : null}
    </div>
  );
};

const DashboardLayout = () => {
  return (
    <div className="app-shell min-h-screen flex flex-col">
      <Navbar />
      <main className="fade-in flex-1 overflow-auto px-3 py-4 pt-20 md:px-6 md:py-6 md:pt-24 lg:px-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthReady } = useAuth();
  if (!isAuthReady) return <div className="p-8 text-gray-500">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" />;
  return <Outlet />;
};

const GuestRoute = () => {
  const { user, isAuthReady } = useAuth();
  if (!isAuthReady) return <div className="p-8 text-gray-500">Loading...</div>;
  if (user) return <Navigate to="/dashboard" />;
  return <Outlet />;
};

const AutoEntryRoute = () => {
  const { user, isAuthReady } = useAuth();
  if (!isAuthReady) return <div className="p-8 text-gray-500">Loading...</div>;
  return <Navigate to={user ? '/dashboard' : '/login'} replace />;
};

function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route path="/" element={<AutoEntryRoute />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/job/:id" element={<JobDetails />} />
          
          <Route path="/dashboard" element={<Dashboard />} />
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
          <Route path="/profile" element={<MyProfile />} />

          <Route element={<ProtectedRoute allowedRoles={['seeker', 'admin']} />}>
            <Route path="/find-jobs" element={<FindJobs />} />
            <Route path="/applications" element={<MyApplications />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['employer', 'admin']} />}>
            <Route path="/post-job" element={<PostJob />} />
            <Route path="/manage-jobs" element={<ManageJobs />} />
            <Route path="/applicants" element={<Applicants />} />
            <Route path="/applicants/:id/profile" element={<ApplicantProfile />} />
            <Route path="/company-settings" element={<CompanySettings />} />
          </Route>

        </Route>
      </Route>

      <Route path="*" element={<AutoEntryRoute />} />
    </Routes>
  );
}

export default App;
