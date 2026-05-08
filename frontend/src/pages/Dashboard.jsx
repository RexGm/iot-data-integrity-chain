import { useMemo } from 'react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Thermometer, Droplets, Database, Activity,
  Cpu, Clock, TrendingUp, Shield,
} from 'lucide-react';
import { useSensorData, useDeviceList, useParsedSensorData } from '../hooks/useSensorData';
import './Dashboard.css';

function MetricCard({ icon: Icon, value, label, color, delay }) {
  const bgMap = {
    blue: 'rgba(10,132,255,0.1)',
    green: 'rgba(48,209,88,0.1)',
    purple: 'rgba(191,90,242,0.1)',
    orange: 'rgba(255,159,10,0.1)',
    cyan: 'rgba(100,210,255,0.1)',
  };
  const colorMap = {
    blue: 'var(--accent-blue)',
    green: 'var(--accent-green)',
    purple: 'var(--accent-purple)',
    orange: 'var(--accent-orange)',
    cyan: 'var(--accent-cyan)',
  };
  return (
    <div className={`glass-card metric-card animate-in animate-delay-${delay}`}>
      <div className="metric-icon" style={{ background: bgMap[color], color: colorMap[color] }}>
        <Icon size={20} />
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-label">{label}</div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="tooltip-label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { data, loading } = useSensorData(5000);
  const devices = useDeviceList(data);
  const parsed = useParsedSensorData(data);

  const stats = useMemo(() => {
    if (!parsed.length) return { avgTemp: 0, avgHum: 0, total: 0, deviceCount: 0 };
    const temps = parsed.filter(d => d.parsed.temperature != null).map(d => d.parsed.temperature);
    const hums = parsed.filter(d => d.parsed.humidity != null).map(d => d.parsed.humidity);
    return {
      avgTemp: temps.length ? (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1) : '—',
      avgHum: hums.length ? (hums.reduce((a, b) => a + b, 0) / hums.length).toFixed(1) : '—',
      total: data.length,
      deviceCount: devices.length,
    };
  }, [parsed, data, devices]);

  const chartData = useMemo(() => {
    const last = parsed.slice(-60);
    return last.map((d, i) => ({
      name: new Date(d.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      temp: d.parsed.temperature ?? null,
      hum: d.parsed.humidity ?? null,
      device: d.deviceId,
    }));
  }, [parsed]);

  const deviceCharts = useMemo(() => {
    const map = {};
    parsed.forEach(d => {
      if (!map[d.deviceId]) map[d.deviceId] = [];
      map[d.deviceId].push({
        time: new Date(d.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        temp: d.parsed.temperature,
        hum: d.parsed.humidity,
      });
    });
    Object.keys(map).forEach(k => { map[k] = map[k].slice(-20); });
    return map;
  }, [parsed]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header"><h1 className="page-title">Dashboard</h1></div>
        <div className="grid-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card metric-card"><div className="skeleton" style={{ height: 80 }} /></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header animate-in">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">IoT sensör ağının gerçek zamanlı genel görünümü</p>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        <MetricCard icon={Thermometer} value={`${stats.avgTemp}°C`} label="Ort. Sıcaklık" color="orange" delay={1} />
        <MetricCard icon={Droplets} value={`${stats.avgHum}%`} label="Ort. Nem" color="cyan" delay={2} />
        <MetricCard icon={Database} value={stats.total.toLocaleString()} label="Toplam Kayıt" color="purple" delay={3} />
        <MetricCard icon={Cpu} value={stats.deviceCount} label="Aktif Cihaz" color="green" delay={4} />
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="glass-card chart-card animate-in animate-delay-2">
          <div className="chart-header">
            <div className="chart-title-row">
              <Thermometer size={16} style={{ color: 'var(--accent-orange)' }} />
              <h3>Sıcaklık Trendi</h3>
            </div>
            <span className="badge badge-orange">Son 60</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff9f0a" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#ff9f0a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="temp" stroke="#ff9f0a" strokeWidth={2} fill="url(#tempGrad)" name="Sıcaklık (°C)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card chart-card animate-in animate-delay-3">
          <div className="chart-header">
            <div className="chart-title-row">
              <Droplets size={16} style={{ color: 'var(--accent-cyan)' }} />
              <h3>Nem Trendi</h3>
            </div>
            <span className="badge badge-blue">Son 60</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="humGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#64d2ff" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#64d2ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="hum" stroke="#64d2ff" strokeWidth={2} fill="url(#humGrad)" name="Nem (%)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {devices.length > 0 && (
        <div className="animate-in animate-delay-4">
          <h2 className="section-title"><Activity size={16} /> Cihaz Bazlı Son Okumalar</h2>
          <div className="device-strip">
            {devices.map(deviceId => {
              const devData = deviceCharts[deviceId] || [];
              const lastItem = devData[devData.length - 1];
              return (
                <div key={deviceId} className="glass-card device-mini-card">
                  <div className="device-mini-header">
                    <span className="status-dot online" />
                    <span className="device-mini-id">{deviceId}</span>
                  </div>
                  {lastItem && (
                    <div className="device-mini-values">
                      <div className="mini-val">
                        <Thermometer size={12} style={{ color: 'var(--accent-orange)' }} />
                        <span>{lastItem.temp?.toFixed(1) ?? '—'}°C</span>
                      </div>
                      <div className="mini-val">
                        <Droplets size={12} style={{ color: 'var(--accent-cyan)' }} />
                        <span>{lastItem.hum?.toFixed(1) ?? '—'}%</span>
                      </div>
                    </div>
                  )}
                  <ResponsiveContainer width="100%" height={60}>
                    <LineChart data={devData}>
                      <Line type="monotone" dataKey="temp" stroke="#ff9f0a" strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="glass-card recent-table animate-in animate-delay-4" style={{ marginTop: 24 }}>
        <div className="chart-header">
          <div className="chart-title-row">
            <Clock size={16} />
            <h3>Son Kayıtlar</h3>
          </div>
          <span className="badge badge-purple">Son 10</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th><th>Cihaz</th><th>Sıcaklık</th><th>Nem</th><th>Hash</th><th>Tarih</th>
              </tr>
            </thead>
            <tbody>
              {parsed.slice(-10).reverse().map(row => (
                <tr key={row.id}>
                  <td style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>#{row.id}</td>
                  <td><span className="badge badge-green">{row.deviceId}</span></td>
                  <td>{row.parsed.temperature?.toFixed(1) ?? '—'}°C</td>
                  <td>{row.parsed.humidity?.toFixed(1) ?? '—'}%</td>
                  <td>
                    <span className="hash-cell hash-truncated" data-full={row.hash}>
                      {row.hash?.substring(0, 16)}…
                    </span>
                  </td>
                  <td style={{ fontSize: 12 }}>{new Date(row.createdAt).toLocaleString('tr-TR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
