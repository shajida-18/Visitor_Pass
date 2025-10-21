import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import PageHeader from '../components/PageHeader';
import QRCode from 'react-qr-code';

export default function VisitorDashboard() {
  const [passes, setPasses] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      // backend will restrict for visitor role and only return their data
      const [p, a] = await Promise.all([
        api.listPasses({ limit: 50, page: 1 }),
        api.listAppointments({ limit: 50, page: 1 })
      ]);
      setPasses(p.items || []);
      setAppointments(a.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="section">
      <PageHeader title="Visitor Dashboard" subtitle="View your passes and appointments" />
      <div className="grid-2eq align-start">
        <div className="card">
          <h3>Your Passes</h3>
          {loading ? <div>Loading...</div> : passes.length === 0 ? <div className="muted">No passes found.</div> : (
            <div className="grid" style={{ gridTemplateColumns: 'repeat(1, 1fr)' }}>
              {passes.map(p => (
                <div key={p._id} className="card" data-aos="fade-up">
                  <div className="row" style={{ alignItems: 'center' }}>
                    <div>
                      <div><strong>Code:</strong> {p.code}</div>
                      <div className="muted"><strong>Status:</strong> {p.status}</div>
                      <div className="muted"><strong>Valid:</strong> {new Date(p.validFrom).toLocaleString()} → {new Date(p.validTo).toLocaleString()}</div>
                      <div style={{ marginTop: 8 }}>
                        <a className="btn outline" href={api.passQrUrl(p._id)} target="_blank" rel="noreferrer">Open QR</a>
                        <a className="btn outline" href={api.passPdfUrl(p._id)} target="_blank" rel="noreferrer" style={{ marginLeft: 8 }}>Download Badge</a>
                      </div>
                    </div>
                    <div>
                      <QRCode value={p.code} size={96} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3>Your Appointments</h3>
          {loading ? <div>Loading...</div> : appointments.length === 0 ? <div className="muted">No appointments found.</div> : (
            <table className="table">
              <thead><tr><th>Host</th><th>Start</th><th>End</th><th>Status</th></tr></thead>
              <tbody>
                {appointments.map(a => (
                  <tr key={a._id}>
                    <td>{a.hostUserId?.name || '-'}</td>
                    <td>{new Date(a.startTime).toLocaleString()}</td>
                    <td>{a.endTime ? new Date(a.endTime).toLocaleString() : '-'}</td>
                    <td>{a.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}