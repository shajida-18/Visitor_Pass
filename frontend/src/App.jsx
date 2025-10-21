import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import AOS from 'aos';

import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Visitors from './pages/Visitors.jsx';
import Appointments from './pages/Appointments.jsx';
import Passes from './pages/Passes.jsx';
import Scan from './pages/Scan.jsx';
import Users from './pages/admin/Users.jsx';
import VisitorDashboard from './pages/VisitorDashboard.jsx';

import RequireAuth from './components/RequireAuth.jsx';
import RequireRole from './components/RequireRole.jsx';
import NavBar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  const location = useLocation();
  useEffect(() => { AOS.refresh(); }, [location.pathname]);

  return (
    <div className="app">
      <NavBar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/visitors" element={<RequireAuth><RequireRole roles={['admin','security','host']}><Visitors /></RequireRole></RequireAuth>} />
          <Route path="/appointments" element={<RequireAuth><RequireRole roles={['admin','security','host']}><Appointments /></RequireRole></RequireAuth>} />
          <Route path="/passes" element={<RequireAuth><RequireRole roles={['admin','security','host']}><Passes /></RequireRole></RequireAuth>} />
          <Route path="/scan" element={<RequireAuth><RequireRole roles={['admin','security']}><Scan /></RequireRole></RequireAuth>} />

          <Route path="/admin/users" element={<RequireAuth><RequireRole roles={['admin']}><Users /></RequireRole></RequireAuth>} />
<Route path="/visitor" element={<RequireAuth><RequireRole roles={['visitor']}><VisitorDashboard /></RequireRole></RequireAuth>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}