import { useAuth } from '../context/AuthContext';
import AdminDashboard from './dashboard/AdminDashboard.jsx';
import SecurityDashboard from './dashboard/SecurityDashboard.jsx';
import HostDashboard from './dashboard/HostDashboard.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  if (!user) return null;

  const role = String(user.role || '').toLowerCase();

  if (role === 'admin') return <AdminDashboard />;
  if (role === 'security') return <SecurityDashboard />;
  // Default to Host dashboard for anything else (defensive)
  return <HostDashboard />;
}