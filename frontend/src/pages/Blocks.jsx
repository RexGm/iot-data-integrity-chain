import { useEffect, useRef } from 'react';
import { Box, Hash, Clock, Cpu, Link2, ShieldCheck } from 'lucide-react';
import { useSensorData } from '../hooks/useSensorData';
import './Blocks.css';

export default function Blocks() {
  const { data } = useSensorData(3000); // Polling every 3s for a dynamic feel
  const scrollRef = useRef(null);
  
  // Sadece son 30 bloğu göster
  const recentBlocks = data.slice(-30);

  // Yeni blok geldiğinde en sağa scroll et
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: scrollRef.current.scrollWidth,
        behavior: 'smooth'
      });
    }
  }, [data.length]);

  return (
    <div className="page-container">
      <div className="page-header animate-in">
        <h1 className="page-title">Blok Zinciri (Live)</h1>
        <p className="page-subtitle">Ağa eklenen son işlemlerin gerçek zamanlı blok görünümü</p>
      </div>

      <div className="blocks-stats animate-in animate-delay-1">
        <div className="glass-card stat-pill">
          <Box size={18} className="text-blue" />
          <span>Toplam Blok: <strong>{data.length}</strong></span>
        </div>
        <div className="glass-card stat-pill">
          <ShieldCheck size={18} className="text-green" />
          <span>Durum: <strong className="text-green">Güvenli</strong></span>
        </div>
        <div className="glass-card stat-pill pulse-glow">
          <div className="live-dot" />
          <span>Ağ Dinleniyor...</span>
        </div>
      </div>

      <div className="blockchain-viewport animate-in animate-delay-2" ref={scrollRef}>
        <div className="blockchain-track">
          {recentBlocks.map((block, index) => (
            <div key={block.id} className="block-wrapper">
              {/* Blok Kartı */}
              <div className="glass-card chain-block">
                <div className="block-header">
                  <div className="block-id">
                    <Box size={14} />
                    <span>Blok #{block.id}</span>
                  </div>
                  <div className="block-badge">Success</div>
                </div>
                
                <div className="block-body">
                  <div className="b-row">
                    <Cpu size={14} />
                    <span className="b-label">Kaynak:</span>
                    <strong className="b-val text-green">{block.deviceId}</strong>
                  </div>
                  <div className="b-row">
                    <Clock size={14} />
                    <span className="b-label">Zaman:</span>
                    <strong className="b-val">{new Date(block.createdAt).toLocaleTimeString('tr-TR')}</strong>
                  </div>
                </div>

                <div className="block-footer">
                  <div className="hash-label">
                    <Hash size={12} /> SHA-256 Damgası
                  </div>
                  <div className="hash-value" title={block.hash}>
                    {block.hash.substring(0, 24)}...
                  </div>
                </div>
              </div>

              {/* Zincir Bağlantı Çizgisi (Son blok değilse) */}
              {index < recentBlocks.length - 1 && (
                <div className="chain-link">
                  <Link2 size={24} className="link-icon" />
                  <div className="link-line" />
                  {/* Animasyonlu veri akış topu */}
                  <div className="link-packet" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
