import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import { Html5QrcodeScanner } from 'html5-qrcode';
import PageHeader from '../components/PageHeader';

export default function Scan() {
  const [type, setType] = useState('checkin');
  const [lastResult, setLastResult] = useState(null);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!cooldown) return;
    const t = setTimeout(() => setCooldown(false), 1500);
    return () => clearTimeout(t);
  }, [cooldown]);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: 260, rememberLastUsedCamera: true }, false);

    async function onScanSuccess(decodedText) {
      if (!decodedText || cooldown) return;
      try {
        setError(''); setCooldown(true);
        const res = await api.scan({ code: decodedText, type, location: 'Frontdesk' });
        setLastResult({
          code: decodedText, type, status: res?.pass?.status, visitor: res?.pass?.visitorId,
          time: new Date().toLocaleString()
        });
      } catch (e) { setError(e.message || 'Scan failed'); }
    }

    function onScanFailure(err) {
      if (typeof err === 'string' && err.toLowerCase().includes('camera')) setError(err);
    }

    scanner.render(onScanSuccess, onScanFailure);
    scannerRef.current = scanner;

    return () => { scannerRef.current?.clear().catch(()=>{}); scannerRef.current = null; };
  }, [type, cooldown]);

  return (
    <div className="section">
      <PageHeader
        title="Scan Pass"
        subtitle="Use your device camera to scan visitor pass QR codes."
        right={
          <label>Mode
            <select value={type} onChange={(e)=>setType(e.target.value)} style={{ marginLeft: 8 }}>
              <option value="checkin">Check-in</option>
              <option value="checkout">Check-out</option>
            </select>
          </label>
        }
      />
      <div className="card">
        <div id="qr-reader" className="scanner" />
      </div>

      {lastResult && (
        <div className="card" style={{ marginTop: 16 }}>
          <h4>Last Scan</h4>
          <div><strong>Code:</strong> {lastResult.code}</div>
          <div><strong>Type:</strong> {lastResult.type}</div>
          <div><strong>Status:</strong> {lastResult.status}</div>
          <div><strong>Time:</strong> {lastResult.time}</div>
        </div>
      )}
      {error && <div className="card" style={{ marginTop: 16, borderColor: '#fee2e2', background: '#fff1f2' }}>{error}</div>}
    </div>
  );
}