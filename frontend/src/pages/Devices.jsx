import { useState, useMemo } from 'react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Cpu, Thermometer, Droplets, Hash, Clock, ChevronRight } from 'lucide-react';
import { useSensorData, useDeviceList, useParsedSensorData } from '../hooks/useSensorData';
import './Devices.css';

function GaugeRing({ value, max, color, label, unit }) {
  const pct = Math.min(value / max, 1);
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;
  return (
    <div className="gauge-container">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease' }} />
      </svg>
      <div className="gauge-value">
        {value.toFixed(1)}<small>{unit}</small>
        <span>{label}</span>
      </div>
    </div>
  );
}

export default function Devices() {
  const { data, loading } = useSensorData(5000);
  const devices = useDeviceList(data);
  const parsed = useParsedSensorData(data);
  const [selected, setSelected] = useState(null);

  const activeDevice = selected || devices[0] || null;

  const deviceData = useMemo(() => {
    if (!activeDevice) return [];
    return parsed
      .filter(d => d.deviceId === activeDevice)
      .map(d => ({
        time: new Date(d.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        temp: d.parsed.temperature,
        hum: d.parsed.humidity,
        id: d.id,
        hash: d.hash,
        createdAt: d.createdAt,
      }));
  }, [parsed, activeDevice]);

  const latest = deviceData[deviceData.length - 1];
  const chartSlice = deviceData.slice(-30);

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header"><h1 className="page-title">Cihazlar</h1></div>
        <div className="skeleton" style={{ height: 400 }} />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header animate-in">
        <h1 className="page-title">Cihaz Detayları</h1>
        <p className="page-subtitle">Sensör cihazlarını seçerek detaylı analiz yapın</p>
      </div>

      <div className="device-selector animate-in animate-delay-1">
        {devices.map(d => (
          <button
            key={d}
            className={`device-chip ${d === activeDevice ? 'active' : ''}`}
            onClick={() => setSelected(d)}
          >
            <Cpu size={14} />
            {d}
          </button>
        ))}
      </div>

      {activeDevice && latest && (
        <>
          <div className="grid-2 animate-in animate-delay-2" style={{ marginBottom: 24 }}>
            <div className="glass-card gauge-card">
              <GaugeRing value={latest.temp ?? 0} max={50} color="#ff9f0a" label="Sıcaklık" unit="°C" />
            </div>
            <div className="glass-card gauge-card">
              <GaugeRing value={latest.hum ?? 0} max={100} color="#64d2ff" label="Nem" unit="%" />
            </div>
          </div>

          <div className="grid-2 animate-in animate-delay-3" style={{ marginBottom: 24 }}>
            <div className="glass-card chart-card">
              <div className="chart-header">
                <div className="chart-title-row"><Thermometer size={16} style={{ color: 'var(--accent-orange)' }} /><h3>Sıcaklık — {activeDevice}</h3></div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartSlice}>
                  <defs>
                    <linearGradient id="dtGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff9f0a" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#ff9f0a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="time" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-glass)', borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="temp" stroke="#ff9f0a" strokeWidth={2} fill="url(#dtGrad)" name="°C" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="glass-card chart-card">
              <div className="chart-header">
                <div className="chart-title-row"><Droplets size={16} style={{ color: 'var(--accent-cyan)' }} /><h3>Nem — {activeDevice}</h3></div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartSlice}>
                  <defs>
                    <linearGradient id="dhGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#64d2ff" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#64d2ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="time" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-glass)', borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="hum" stroke="#64d2ff" strokeWidth={2} fill="url(#dhGrad)" name="%" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card recent-table animate-in animate-delay-4">
            <div className="chart-header">
              <div className="chart-title-row"><Clock size={16} /><h3>{activeDevice} — Geçmiş</h3></div>
              <span className="badge badge-green">{deviceData.length} kayıt</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr><th>ID</th><th>Sıcaklık</th><th>Nem</th><th>Hash</th><th>Tarih</th></tr>
                </thead>
                <tbody>
                  {deviceData.slice(-15).reverse().map(row => (
                    <tr key={row.id}>
                      <td style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>#{row.id}</td>
                      <td>{row.temp?.toFixed(1) ?? '—'}°C</td>
                      <td>{row.hum?.toFixed(1) ?? '—'}%</td>
                      <td><span className="hash-cell hash-truncated" data-full={row.hash}>{row.hash?.substring(0, 16)}…</span></td>
                      <td style={{ fontSize: 12 }}>{new Date(row.createdAt).toLocaleString('tr-TR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
