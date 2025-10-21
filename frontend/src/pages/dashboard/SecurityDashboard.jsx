import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import PageHeader from '../../components/PageHeader';

export default function SecurityDashboard() {
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [logs, setLogs] = useState([]);

  const startOfDayISO = useMemo(() => {
    const d = new Date(); d.setHours(0,0,0,0); return d.toISOString();
  }, []);
  const endOfDayISO = useMemo(() => {
    const d = new Date(); d.setHours(23,59,59,999); return d.toISOString();
  }, []);

  async function load() {
    const [a, l] = await Promise.all([
      api.listAppointments({ from: startOfDayISO, to: endOfDayISO, limit: 10, page: 1 }),
      api.listCheckLogs({ limit: 10, page: 1 })
    ]);
    setTodayAppointments(a.items || []);
    setLogs(l.items || []);
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="section">
      <PageHeader
        title="Security Dashboard"
        subtitle="Monitor today's schedule and scan visitor passes."
        right={<Link to="/scan" className="btn">Open Scanner</Link>}
      />

      <div className="grid-2">
        <div className="card">
          <h3>Today’s Appointments</h3>
          {todayAppointments.length ? (
            <table className="table">
              <thead>
                <tr><th>Visitor</th><th>Host</th><th>Start</th><th>Status</th></tr>
              </thead>
              <tbody>
                {todayAppointments.map(a => (
                  <tr key={a._id}>
                    <td>{a.visitorId?.firstName} {a.visitorId?.lastName}</td>
                    <td>{a.hostUserId?.name}</td>
                    <td>{new Date(a.startTime).toLocaleTimeString()}</td>
                    <td>{a.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <div className="muted">No appointments today.</div>}
        </div>

        <div className="card">
          <h3>Recent Check-ins/outs</h3>
          {logs.length ? (
            <table className="table">
              <thead>
                <tr><th>When</th><th>Type</th><th>Code</th><th>Visitor</th></tr>
              </thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l._id}>
                    <td>{new Date(l.timestamp).toLocaleTimeString()}</td>
                    <td>{l.type}</td>
                    <td>{l.passId?.code}</td>
                    <td>{l.visitorId?.firstName} {l.visitorId?.lastName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <div className="muted">No recent scans.</div>}
        </div>
      </div>
    </div>
  );
}