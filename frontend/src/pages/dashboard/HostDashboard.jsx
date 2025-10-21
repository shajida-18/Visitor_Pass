import { useEffect, useMemo, useState } from 'react';
import { api } from '../../lib/api';
import PageHeader from '../../components/PageHeader';

export default function HostDashboard() {
  const [upcoming, setUpcoming] = useState([]);
  const [msg, setMsg] = useState('');
  const [visitorForm, setVisitorForm] = useState({ firstName: '', lastName: '', email: '', phone: '', company: '' });

  const nowISO = useMemo(() => new Date().toISOString(), []);
  const in14DaysISO = useMemo(() => {
    const d = new Date(); d.setDate(d.getDate() + 14);
    return d.toISOString();
  }, []);

  async function load() {
    const a = await api.listAppointments({ from: nowISO, to: in14DaysISO, limit: 10, page: 1 });
    setUpcoming(a.items || []);
  }

  useEffect(() => { load(); }, []);

  async function addVisitor(e) {
    e.preventDefault();
    setMsg('');
    try {
      await api.createVisitor(visitorForm);
      setMsg('Visitor added');
      setVisitorForm({ firstName: '', lastName: '', email: '', phone: '', company: '' });
    } catch (err) { setMsg(err.message || 'Failed to add visitor'); }
  }

  return (
    <div className="section">
      <PageHeader title="Host Dashboard" subtitle="Your upcoming appointments and quick visitor add." />

      <div className="grid-2">
        <div className="card">
          <h3>My Upcoming Appointments</h3>
          {upcoming.length ? (
            <table className="table">
              <thead>
                <tr><th>Visitor</th><th>Start</th><th>End</th><th>Status</th></tr>
              </thead>
              <tbody>
                {upcoming.map(a => (
                  <tr key={a._id}>
                    <td>{a.visitorId?.firstName} {a.visitorId?.lastName}</td>
                    <td>{new Date(a.startTime).toLocaleString()}</td>
                    <td>{a.endTime ? new Date(a.endTime).toLocaleString() : '-'}</td>
                    <td>{a.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <div className="muted">No upcoming appointments.</div>}
        </div>

        <div className="card">
          <h3>Quick Add Visitor</h3>
          <form className="form" onSubmit={addVisitor}>
            <label>First Name
              <input value={visitorForm.firstName} onChange={(e)=>setVisitorForm({...visitorForm, firstName:e.target.value})} required />
            </label>
            <label>Last Name
              <input value={visitorForm.lastName} onChange={(e)=>setVisitorForm({...visitorForm, lastName:e.target.value})} />
            </label>
            <label>Email
              <input type="email" value={visitorForm.email} onChange={(e)=>setVisitorForm({...visitorForm, email:e.target.value})} />
            </label>
            <label>Phone
              <input value={visitorForm.phone} onChange={(e)=>setVisitorForm({...visitorForm, phone:e.target.value})} />
            </label>
            <label>Company
              <input value={visitorForm.company} onChange={(e)=>setVisitorForm({...visitorForm, company:e.target.value})} />
            </label>
            <button className="btn block" type="submit">Add Visitor</button>
            {msg && <div className="muted">{msg}</div>}
          </form>
        </div>
      </div>
    </div>
  );
}