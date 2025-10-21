import { Link, useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
  const { user, org, logout } = useAuth();
  const { pathname } = useLocation();
  const role = useMemo(() => String(user?.role || '').toLowerCase(), [user]);

  const links = useMemo(() => {
    if (!user) return [];
    const base = [];
    if (role === 'admin') {
      return [{ to: '/dashboard', label: 'Dashboard' }, { to: '/visitors', label: 'Visitors' }, { to: '/appointments', label: 'Appointments' }, { to: '/passes', label: 'Passes' }, { to: '/scan', label: 'Scan' }, { to: '/admin/users', label: 'Users' }];
    }
    if (role === 'security') {
      return [ { to: '/scan', label: 'Scan' }, { to: '/passes', label: 'Passes' },{ to: '/appointments', label: 'Appointments' }];
    }
    if (role === 'host') {
      return [{ to: '/dashboard', label: 'Dashboard' },  { to: '/appointments', label: 'Appointments' }];
    }
    if (role === 'visitor') {
  return [{ to: '/visitor', label: 'My Passes' }, { to: '/visitor', label: 'My Appointments' }];
}
   
  }, [user, role]);

  const isActive = (to) => pathname === to;

  return (
    <nav className="navbar">
      <div className="left">
        <Link to="/" className="brand">Visitor Pass</Link>
        {user && links.map((l) => (
          <Link key={l.to} to={l.to} className={isActive(l.to) ? 'active' : ''}>{l.label}</Link>
        ))}
      </div>
      <div className="right">
        {user ? (
          <>
            <span className="muted">{org?.name} · {user.name} ({role})</span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <Link to="/login" className="btn outline">Login</Link>
        )}
      </div>
    </nav>
  );
}