import { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { api } from '../../lib/api';

export default function Users() {
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await api.listUsers({ limit: 50, page: 1 });
    setItems(res.items || []);
  }
  useEffect(() => { load(); }, []);

  async function onCreate(e) {
    e.preventDefault(); setBusy(true); setMsg('');
    const fd = new FormData(e.currentTarget);
    try {
      const res = await api.createUser({
        name: fd.get('name'), email: fd.get('email'), phone: fd.get('phone') || undefined, role: fd.get('role')
      });
      setMsg(`User created${res.tempPassword ? ` (temp: ${res.tempPassword})` : ''}`);
      e.currentTarget.reset();
      load();
    } catch (er) { setMsg(er.message || 'Failed'); }
    finally { setBusy(false); }
  }

  return (
    <div className="section">
      <PageHeader title="Users" subtitle="Create and view users." />
      <div className="grid-2eq align-start">
        <div className="card">
          <h3>Create User</h3>
          <form className="form" onSubmit={onCreate}>
            <label>Name<input name="name" required /></label>
            <label>Email<input type="email" name="email" required /></label>
            <label>Phone<input name="phone" /></label>
            <label>Role
              <select name="role" defaultValue="host" required>
                <option value="host">Host</option>
                <option value="security">Security</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <button className="btn" type="submit" disabled={busy}>{busy ? 'Creating…' : 'Create'}</button>
            {msg && <div className="muted">{msg}</div>}
          </form>
        </div>
        <div className="card">
          <h3>All Users</h3>
          <table className="table">
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th></tr></thead>
            <tbody>
              {items.map(u => (
                <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.phone || '-'}</td><td>{u.role}</td><td>{u.status}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}