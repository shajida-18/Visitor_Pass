import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, visitorLogin } = useAuth();
  const [mode, setMode] = useState('user'); // 'user' or 'visitor'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'user') {
        await login(email, password);
      } else {
        // visitor mode: email only
        await visitorLogin(email);
      }
      navigate(from, { replace: true });
    } catch (e) {
      setError(e.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <h2>Login</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button className={`btn outline`} onClick={() => setMode('user')} disabled={mode === 'user'}>Staff login</button>
        <button className={`btn outline`} onClick={() => setMode('visitor')} disabled={mode === 'visitor'}>Visitor login</button>
      </div>

      <form onSubmit={onSubmit}>
        <label>Email
          <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        </label>

        {mode === 'user' && (
          <label>Password
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
          </label>
        )}

        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={busy} className="btn block">{busy ? 'Signing in...' : (mode === 'user' ? 'Login' : 'Send access')}</button>
      </form>

      {mode === 'visitor' && <p className="muted">Visitors login with email only. If the email is registered, you will get access to the visitor dashboard.</p>}
    </div>
  );
}