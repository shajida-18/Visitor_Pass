import { useEffect, useMemo, useState } from 'react';
import { api } from '../../lib/api';
import PageHeader from '../../components/PageHeader';

export default function AdminDashboard() {
  const [upcoming, setUpcoming] = useState([]);
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState('');

  const nowISO = useMemo(() => new Date().toISOString(), []);
  const in7DaysISO = useMemo(() => {
    const d = new Date(); d.setDate(d.getDate() + 7);
    return d.toISOString();
  }, []);

  async function load() {
    const [a, l, u] = await Promise.all([
      api.listAppointments({ from: nowISO, to: in7DaysISO, limit: 10, page: 1 }),
      api.listCheckLogs({ limit: 10, page: 1 }),
      api.listUsers({ limit: 10, page: 1 })
    ]);
    setUpcoming(a.items || []);
    setLogs(l.items || []);
    setUsers(u.items || []);
  }

  useEffect(() => { load(); }, []);

  async function onCreateUser(e) {
    e.preventDefault();
    setCreating(true);
    setMsg('');
    const form = new FormData(e.currentTarget);
    try {
      const res = await api.createUser({
        name: form.get('name'),
        email: form.get('email'),
        phone: form.get('phone') || undefined,
        role: form.get('role')
      });
      setMsg(`User created${res?.tempPassword ? ` (temp password: ${res.tempPassword})` : ''}`);
      e.currentTarget.reset();
      load();
    } catch (err) {
      setMsg(err.message || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="section">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Overview of upcoming appointments, recent visitor logs, and user management."
      />

      {/* Row 1: Upcoming appointments (full width) */}
      <div className="card" data-aos="fade-up">
        <h3>Upcoming Appointments (7 days)</h3>
        {upcoming.length ? (
          <table className="table">
            <thead>
              <tr><th>Visitor</th><th>Host</th><th>Start</th><th>End</th><th>Status</th></tr>
            </thead>
            <tbody>
              {upcoming.map(a => (
                <tr key={a._id}>
                  <td>{a.visitorId?.firstName} {a.visitorId?.lastName}</td>
                  <td>{a.hostUserId?.name}</td>
                  <td>{new Date(a.startTime).toLocaleString()}</td>
                  <td>{a.endTime ? new Date(a.endTime).toLocaleString() : '-'}</td>
                  <td>{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <div className="muted">No upcoming appointments.</div>}
      </div>

      {/* Row 2: Logs + Create user (two equal columns, top aligned) */}
      <div className="section grid-2eq align-start">
        <div className="card" data-aos="fade-right">
          <h3>Recent Visitor Logs</h3>
          {logs.length ? (
            <table className="table">
              <thead>
                <tr><th>When</th><th>Type</th><th>Code</th><th>Visitor</th></tr>
              </thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l._id}>
                    <td>{new Date(l.timestamp).toLocaleString()}</td>
                    <td>{l.type}</td>
                    <td>{l.passId?.code}</td>
                    <td>{l.visitorId?.firstName} {l.visitorId?.lastName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <div className="muted">No logs yet.</div>}
        </div>

        <div className="card" data-aos="fade-left">
          <h3>Create User (Host/Security/Admin)</h3>
          <form className="form" onSubmit={onCreateUser} autoComplete="off">
            <label>Name
              <input name="name" required />
            </label>
            <label>Email
              <input type="email" name="email" required />
            </label>
            <label>Phone
              <input name="phone" />
            </label>
            <label>Role
              <select name="role" required defaultValue="host">
                <option value="host">Host</option>
                <option value="security">Security</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <button className="btn block" type="submit" disabled={creating}>
              {creating ? 'Creating…' : 'Create User'}
            </button>
            {msg && <div className="muted">{msg}</div>}
          </form>
        </div>
      </div>

      {/* Row 3: Latest users (full width) */}
      <div className="card" data-aos="fade-up">
        <h3>Latest Users</h3>
        {users.length ? (
          <table className="table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id || u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone || '-'}</td>
                  <td>{u.role}</td>
                  <td>{u.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <div className="muted">No users found.</div>}
      </div>
    </div>
  );
}