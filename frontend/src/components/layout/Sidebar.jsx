import { NavLink, useLocation } from 'react-router-dom';
import { useHealthCheck } from '../../hooks/useSensorData';
import {
  LayoutDashboard,
  Cpu,
  ShieldCheck,
  Info,
  Activity,
  Waves,
  Box,
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/blocks', icon: Box, label: 'Blok Zinciri' },
  { to: '/devices', icon: Cpu, label: 'Cihazlar' },
  { to: '/integrity', icon: ShieldCheck, label: 'Bütünlük' },
  { to: '/about', icon: Info, label: 'Hakkında' },
];

export default function Sidebar() {
  const location = useLocation();
  const { apiOk } = useHealthCheck();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Waves size={22} strokeWidth={2.5} />
        </div>
        <div className="brand-text">
          <span className="brand-name">IoT Chain</span>
          <span className="brand-sub">Data Integrity</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
            {location.pathname === to && <div className="nav-indicator" />}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="system-status">
          <div className="status-row">
            <span className={`status-dot ${apiOk ? 'online' : 'offline'}`} />
            <span>API</span>
            <span className={`status-label ${apiOk ? 'ok' : 'err'}`}>
              {apiOk ? 'Çalışıyor' : 'Kapalı'}
            </span>
          </div>
          <div className="status-row">
            <Activity size={12} className="mqtt-pulse" />
            <span>MQTT</span>
            <span className="status-label ok">Aktif</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
