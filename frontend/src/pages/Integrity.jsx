import { useState, useCallback } from 'react';
import { ShieldCheck, ShieldAlert, CheckCircle2, XCircle, Search, Loader2, Hash, Link2 } from 'lucide-react';
import { useSensorData, useParsedSensorData } from '../hooks/useSensorData';
import { sensorApi } from '../api/sensorApi';
import './Integrity.css';

export default function Integrity() {
  const { data, loading } = useSensorData(8000);
  const parsed = useParsedSensorData(data);
  const [results, setResults] = useState({});
  const [verifying, setVerifying] = useState({});
  const [filter, setFilter] = useState('');

  const verify = useCallback(async (item, type) => {
    const key = `${item.id}-${type}`;
    setVerifying(p => ({ ...p, [key]: true }));
    try {
      let res;
      if (type === 'local') {
        res = await sensorApi.verifyLocal(item.id);
      } else if (type === 'hash') {
        res = await sensorApi.verifyIntegrity(item.id, item.rawData);
      } else {
        res = await sensorApi.verifyBlockchain(item.id, item.rawData);
      }
      setResults(p => ({ ...p, [key]: res }));
    } catch (err) {
      setResults(p => ({ ...p, [key]: { isValid: false, message: err.message } }));
    } finally {
      setVerifying(p => ({ ...p, [key]: false }));
    }
  }, []);

  const filtered = filter
    ? parsed.filter(d => d.deviceId.toLowerCase().includes(filter.toLowerCase()) || String(d.id).includes(filter))
    : parsed;

  const displayed = filtered.slice(-50).reverse();

  return (
    <div className="page-container">
      <div className="page-header animate-in">
        <h1 className="page-title">Veri Bütünlüğü</h1>
        <p className="page-subtitle">SHA-256 hash ve Blockchain doğrulaması ile verilerin manipüle edilmediğini kontrol edin</p>
      </div>

      <div className="integrity-toolbar animate-in animate-delay-1">
        <div className="search-box">
          <Search size={16} />
          <input type="text" placeholder="ID veya Cihaz adı ile ara..." value={filter} onChange={e => setFilter(e.target.value)} />
        </div>
        <div className="toolbar-info">
          <span className="badge badge-purple">{data.length} Toplam Kayıt</span>
        </div>
      </div>

      <div className="glass-card integrity-table-wrap animate-in animate-delay-2">
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cihaz</th>
                <th>Sıcaklık</th>
                <th>Nem</th>
                <th>SHA-256 Hash</th>
                <th>Tarih</th>
                <th style={{ textAlign: 'center' }}>Yerel</th>
                <th style={{ textAlign: 'center' }}>Hash</th>
                <th style={{ textAlign: 'center' }}>Blockchain</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map(row => {
                const localKey = `${row.id}-local`;
                const hashKey = `${row.id}-hash`;
                const bcKey = `${row.id}-blockchain`;
                return (
                  <tr key={row.id}>
                    <td style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>#{row.id}</td>
                    <td><span className="badge badge-green">{row.deviceId}</span></td>
                    <td>{row.parsed.temperature?.toFixed(1) ?? '—'}°C</td>
                    <td>{row.parsed.humidity?.toFixed(1) ?? '—'}%</td>
                    <td>
                      <span className="hash-cell hash-truncated" data-full={row.hash}>
                        {row.hash?.substring(0, 20)}…
                      </span>
                    </td>
                    <td style={{ fontSize: 12 }}>{new Date(row.createdAt).toLocaleString('tr-TR')}</td>
                    <td style={{ textAlign: 'center' }}>
                      <VerifyButton
                        result={results[localKey]}
                        loading={verifying[localKey]}
                        onClick={() => verify(row, 'local')}
                        label="Yerel"
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <VerifyButton
                        result={results[hashKey]}
                        loading={verifying[hashKey]}
                        onClick={() => verify(row, 'hash')}
                        label="Hash"
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <VerifyButton
                        result={results[bcKey]}
                        loading={verifying[bcKey]}
                        onClick={() => verify(row, 'blockchain')}
                        label="BC"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function VerifyButton({ result, loading, onClick, label }) {
  if (loading) {
    return <Loader2 size={16} className="spin" style={{ color: 'var(--accent-blue)' }} />;
  }
  if (result) {
    // Java backend: Lombok @Data + `boolean isValid` → Jackson serializes as "valid" (strips "is" prefix)
    const ok = result.valid ?? result.isValid;
    return ok ? (
      <span className="verify-success" title={result.message}>
        <CheckCircle2 size={18} />
      </span>
    ) : (
      <span className="verify-fail" title={result.message}>
        <XCircle size={18} />
      </span>
    );
  }
  return (
    <button className="btn btn-ghost btn-sm verify-btn" onClick={onClick} title={`${label} doğrula`}>
      <ShieldCheck size={13} />
    </button>
  );
}
