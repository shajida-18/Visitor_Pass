const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
function getToken() { return localStorage.getItem('token'); }

async function request(path, { method = 'GET', body, headers } = {}) {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(headers || {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  if (res.status === 401) { localStorage.removeItem('token'); window.location.href = '/login'; return; }
  const ct = res.headers.get('content-type') || '';
  const data = ct.includes('application/json') ? await res.json() : await res.text();
  if (!res.ok) throw new Error(data?.error || (typeof data === 'string' ? data : 'Request failed'));
  return data;
}

export const api = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  me: () => request('/auth/me'),
  // Public
  preRegister: (payload) => request('/public/pre-register', { method: 'POST', body: payload }),
  getPublicPass: (code) => request(`/public/pass/${encodeURIComponent(code)}`),
  // Visitors
  listVisitors: (params = {}) => request(`/visitors${makeQS(params)}`),
  createVisitor: (payload) => request('/visitors', { method: 'POST', body: payload }),
    visitorLogin: (email) => request('/auth/visitor-login', { method: 'POST', body: { email } }),

  // Appointments
  listAppointments: (params = {}) => request(`/appointments${makeQS(params)}`),
  createAppointment: (payload) => request('/appointments', { method: 'POST', body: payload }),
  // Passes
  listPasses: (params = {}) => request(`/passes${makeQS(params)}`),
  issuePass: (payload) => request('/passes/issue', { method: 'POST', body: payload }),
  // Logs
  listCheckLogs: (params = {}) => request(`/check-logs${makeQS(params)}`),
  scan: (payload) => request('/check-logs/scan', { method: 'POST', body: payload }),
  // Admin users
  listUsers: (params = {}) => request(`/users${makeQS(params)}`),
  createUser: (payload) => request('/users', { method: 'POST', body: payload }),
  // Helpers
  passQrUrl: (id) => `${API_URL}/passes/${id}/qr.png`,
  passPdfUrl: (id) => `${API_URL}/passes/${id}/badge.pdf`
};

function makeQS(params) {
  const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== '')).toString();
  return q ? `?${q}` : '';
}