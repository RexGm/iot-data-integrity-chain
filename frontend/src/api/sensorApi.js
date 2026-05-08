const API_BASE = '/api/sensor-data';

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const sensorApi = {
  health: () => fetch(`${API_BASE}/health`).then(r => r.ok),

  getAll: () => request(API_BASE),

  getById: (id) => request(`${API_BASE}/${id}`),

  getByDevice: (deviceId) => request(`${API_BASE}/device/${deviceId}`),

  create: (deviceId, rawData) =>
    request(API_BASE, {
      method: 'POST',
      body: JSON.stringify({ deviceId, rawData }),
    }),

  verifyIntegrity: (id, rawData) =>
    request(`${API_BASE}/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify({ rawData }),
    }),

  verifyLocal: (id) => request(`${API_BASE}/${id}/verify-local`),

  verifyBlockchain: (id, rawData) =>
    request(`${API_BASE}/${id}/verify-blockchain`, {
      method: 'POST',
      body: JSON.stringify({ rawData }),
    }),

  getBlockchainRecord: (id) => request(`${API_BASE}/${id}/blockchain-record`),

  getBlockchainHistory: (id) => request(`${API_BASE}/${id}/blockchain-history`),
};
