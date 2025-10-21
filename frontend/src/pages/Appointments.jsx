import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import PageHeader from '../components/PageHeader';

export default function Appointments() {
  const [items, setItems] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ visitorId: '', startTime: '', endTime: '', purpose: '', location: '' });
  const [copiedId, setCopiedId] = useState(null); // track last-copied id for feedback

  async function load() {
    setLoading(true);
    try {
      const [a, v] = await Promise.all([
        api.listAppointments({ limit: 20, page: 1 }),
        api.listVisitors({ limit: 100, page: 1 })
      ]);
      setItems(a.items || []);
      setVisitors(v.items || []);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function onCreate(e) {
    e.preventDefault();
    setMsg('');
    try {
      await api.createAppointment(form);
      setForm({ visitorId: '', startTime: '', endTime: '', purpose: '', location: '' });
      setMsg('Appointment created');
      load();
    } catch (e) { setMsg(e.message || 'Failed to create'); }
  }

  async function copyId(id) {
    if (!id) return;
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch (err) {
      console.error('copy failed', err);
      setMsg('Copy failed — please select the ID and copy manually.');
      setTimeout(() => setMsg(''), 2500);
    }
  }

  return (
    <div className="section">
      <PageHeader title="Appointments" subtitle="Schedule and monitor visitor appointments." />
      <div className="grid-2">
        <div className="card">
          {loading ? <div>Loading...</div> : (
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 160 }}>Appointment ID</th>
                  <th>Visitor</th>
                  <th>Host</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map(a => (
                  <tr key={a._id}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 110 }}>{a._id}</div>
                        <button
                          className="btn outline"
                          style={{ padding: '6px 8px', minHeight: 'auto', fontSize: 13 }}
                          onClick={() => copyId(a._id)}
                          title="Copy appointment ID"
                        >
                          {copiedId === a._id ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </td>
                    <td>{a.visitorId?.firstName} {a.visitorId?.lastName}</td>
                    <td>{a.hostUserId?.name}</td>
                    <td>{new Date(a.startTime).toLocaleString()}</td>
                    <td>{a.endTime ? new Date(a.endTime).toLocaleString() : '-'}</td>
                    <td>{a.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h3>New Appointment</h3>
          <form onSubmit={onCreate} className="form">
            <label>Visitor
              <select value={form.visitorId} onChange={(e)=>setForm({...form, visitorId:e.target.value})} required>
                <option value="">Select visitor</option>
                {visitors.map(v => (
                  <option key={v._id} value={v._id}>{v.firstName} {v.lastName} ({v.email || v.company || 'n/a'})</option>
                ))}
              </select>
            </label>
            <label>Start Time
              <input type="datetime-local" value={form.startTime} onChange={(e)=>setForm({...form, startTime:e.target.value})} required />
            </label>
            <label>End Time
              <input type="datetime-local" value={form.endTime} onChange={(e)=>setForm({...form, endTime:e.target.value})} />
            </label>
            <label>Purpose
              <input value={form.purpose} onChange={(e)=>setForm({...form, purpose:e.target.value})} />
            </label>
            <label>Location
              <input value={form.location} onChange={(e)=>setForm({...form, location:e.target.value})} />
            </label>
            <button type="submit" className="btn">Create</button>
            {msg && <div className="muted">{msg}</div>}
          </form>
        </div>
      </div>
    </div>
  );
}