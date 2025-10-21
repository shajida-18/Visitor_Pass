import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import PageHeader from '../components/PageHeader';

export default function Visitors() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', company: '' });
  const [msg, setMsg] = useState('');

  async function load() {
    setLoading(true);
    try {
      const data = await api.listVisitors({ q, limit: 20, page: 1 });
      setItems(data.items || []);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function onCreate(e) {
    e.preventDefault();
    setMsg('');
    try {
      await api.createVisitor(form);
      setForm({ firstName: '', lastName: '', email: '', phone: '', company: '' });
      setMsg('Visitor created');
      load();
    } catch (e) {
      setMsg(e.message || 'Failed to create');
    }
  }

  return (
    <div className="section">
      <PageHeader title="Visitors" subtitle="Search, view, and add visitors." right={
        <div className="row" style={{ gap: 8 }}>
          <input placeholder="Search visitors..." value={q} onChange={(e)=>setQ(e.target.value)} />
          <button className="btn outline" onClick={load}>Search</button>
        </div>
      } />

      <div className="grid-2">
        <div className="card">
          {loading ? <div>Loading...</div> : (
            <table className="table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Company</th><th>Phone</th></tr>
              </thead>
              <tbody>
                {items.map(v => (
                  <tr key={v._id}>
                    <td>{v.firstName} {v.lastName}</td>
                    <td>{v.email || '-'}</td>
                    <td>{v.company || '-'}</td>
                    <td>{v.phone || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h3>Add Visitor</h3>
          <form onSubmit={onCreate} className="form">
            <label>First Name
              <input value={form.firstName} onChange={(e)=>setForm({...form, firstName:e.target.value})} required />
            </label>
            <label>Last Name
              <input value={form.lastName} onChange={(e)=>setForm({...form, lastName:e.target.value})} />
            </label>
            <label>Email
              <input type="email" value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} />
            </label>
            <label>Phone
              <input value={form.phone} onChange={(e)=>setForm({...form, phone:e.target.value})} />
            </label>
            <label>Company
              <input value={form.company} onChange={(e)=>setForm({...form, company:e.target.value})} />
            </label>
            <button type="submit" className="btn block">Create</button>
            {msg && <div className="muted">{msg}</div>}
          </form>
        </div>
      </div>
    </div>
  );
}