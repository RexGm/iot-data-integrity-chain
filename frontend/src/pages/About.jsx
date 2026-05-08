import {
  Waves, Shield, Database, Cpu, Server, Link2, Lock,
  Thermometer, Droplets, Activity, GitBranch, Layers,
  ArrowRight, ExternalLink, Zap, Globe, Code2, Box,
} from 'lucide-react';
import './About.css';

const techStack = [
  { icon: Code2, name: 'Spring Boot 3', desc: 'Java 21 tabanlı backend REST API. Veri alımı, hash oluşturma ve blockchain entegrasyonu burada yönetiliyor.', color: '#30d158' },
  { icon: Database, name: 'PostgreSQL 16', desc: 'Sensör verilerinin kalıcı olarak saklandığı ilişkisel veritabanı. SHA-256 hash ile unique constraint sağlıyor.', color: '#0a84ff' },
  { icon: Activity, name: 'MQTT (Mosquitto)', desc: 'IoT cihazlarından gelen verileri gerçek zamanlı ileten mesajlaşma protokolü. QoS 1 ile en az bir kez teslim garantisi.', color: '#ff9f0a' },
  { icon: Link2, name: 'Hyperledger Fabric', desc: 'Kurumsal düzey blockchain ağı. Verilerin değiştirilemez bir deftere yazılmasını sağlıyor.', color: '#bf5af2' },
  { icon: Cpu, name: 'Python Simulator', desc: 'Sıcaklık ve nem verisi üreten sensör simülatörü. MQTT üzerinden backend\'e gerçek zamanlı veri gönderiyor.', color: '#64d2ff' },
  { icon: Globe, name: 'React + Vite', desc: 'Modern frontend. Gerçek zamanlı dashboard, cihaz detayları ve veri doğrulama arayüzü.', color: '#ff375f' },
  { icon: Box, name: 'Docker', desc: 'Tüm servislerin container olarak paketlenmesi ve tek komutla ayağa kaldırılması.', color: '#ffd60a' },
  { icon: Lock, name: 'SHA-256 Hashing', desc: 'Her sensör verisinin parmak izi. Verinin tek bir bitinin bile değiştirilip değiştirilmediğini tespit ediyor.', color: '#ff453a' },
];

const dataFlow = [
  { step: '01', title: 'Veri Üretimi', desc: 'Python simülatör sıcaklık ve nem verisini üretir', icon: Thermometer },
  { step: '02', title: 'MQTT Yayını', desc: 'Veri MQTT broker üzerinden yayınlanır (QoS 1)', icon: Activity },
  { step: '03', title: 'Backend İşleme', desc: 'Spring Boot MQTT mesajını alır, SHA-256 hash üretir', icon: Server },
  { step: '04', title: 'Blockchain Kaydı', desc: 'Hash Hyperledger Fabric\'e yazılır (değiştirilemez)', icon: Link2 },
  { step: '05', title: 'DB Saklama', desc: 'Veri + hash PostgreSQL\'e kaydedilir', icon: Database },
  { step: '06', title: 'Doğrulama', desc: 'İstendiğinde DB hash\'i ile blockchain karşılaştırılır', icon: Shield },
];

function AnimatedDataJourney() {
  return (
    <div className="journey-wrapper glass-card">
      <div className="j-container">
        {/* Nodes */}
        <div className="j-node n-sensor">
          <div className="j-icon"><Thermometer size={24} /></div>
          <span>Sensör</span>
        </div>
        <div className="j-node n-mqtt">
          <div className="j-icon"><Activity size={24} /></div>
          <span>MQTT Broker</span>
        </div>
        <div className="j-node n-backend">
          <div className="j-icon"><Server size={24} /></div>
          <span>Spring Boot</span>
        </div>
        <div className="j-node n-db">
          <div className="j-icon"><Database size={24} /></div>
          <span>PostgreSQL</span>
        </div>
        <div className="j-node n-bc">
          <div className="j-icon"><Link2 size={24} /></div>
          <span>Blockchain</span>
        </div>

        {/* Lines */}
        <div className="j-line l-h l-1" />
        <div className="j-line l-h l-2" />
        <div className="j-line l-v l-3" />
        <div className="j-line l-h l-4" />
        
        {/* Animated Packets */}
        <div className="j-packet p-1" />
        <div className="j-packet p-2" />
        <div className="j-packet p-3" />
        <div className="j-packet p-4" />
      </div>
    </div>
  );
}

export default function About() {
  return (
    <div className="page-container about-page">
      {/* Hero */}
      <section className="about-hero animate-in">
        <div className="hero-glow" />
        <div className="hero-icon"><Waves size={36} strokeWidth={2} /></div>
        <h1 className="hero-title">IoT Data Integrity Chain</h1>
        <p className="hero-desc">
          IoT sensörlerinden gelen verilerin bütünlüğünü <strong>blockchain</strong> ve
          <strong> kriptografik hash</strong> fonksiyonları ile garanti altına alan
          uçtan uca bir güvenlik platformu.
        </p>
        <div className="hero-badges">
          <span className="badge badge-green">✓ SHA-256</span>
          <span className="badge badge-purple">✓ Hyperledger Fabric</span>
          <span className="badge badge-blue">✓ Gerçek Zamanlı</span>
          <span className="badge badge-orange">✓ MQTT</span>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="about-section animate-in animate-delay-1">
        <h2 className="section-heading">Neden Bu Proje?</h2>
        <div className="grid-2">
          <div className="glass-card info-card problem-card">
            <div className="info-card-icon" style={{ background: 'var(--accent-red-glow)', color: 'var(--accent-red)' }}>
              <Shield size={22} />
            </div>
            <h3>Problem</h3>
            <p>
              IoT cihazları kritik veriler toplar. Bu verilerin iletim veya depolama sırasında
              <strong> değiştirilmesi (manipülasyon)</strong>, <strong>silinmesi</strong> veya
              <strong> sahte veri eklenmesi</strong> ciddi güvenlik riskleri oluşturur.
              Geleneksel veritabanları tek başına bu tehditlere karşı yeterli koruma sağlayamaz.
            </p>
          </div>
          <div className="glass-card info-card solution-card">
            <div className="info-card-icon" style={{ background: 'var(--accent-green-glow)', color: 'var(--accent-green)' }}>
              <Zap size={22} />
            </div>
            <h3>Çözüm</h3>
            <p>
              Her sensör verisi alındığında <strong>SHA-256 hash</strong> üretilir ve bu hash
              <strong> Hyperledger Fabric blockchain</strong>'e yazılır. Veri doğrulaması yapılmak
              istendiğinde, veritabanındaki hash ile blockchain'deki kayıt karşılaştırılır.
              Tek bir bit bile değişse fark tespit edilir.
            </p>
          </div>
        </div>
      </section>

      {/* Data Flow */}
      <section className="about-section animate-in animate-delay-2">
        <h2 className="section-heading">Veri Akışı</h2>
        <div className="flow-timeline">
          {dataFlow.map(({ step, title, desc, icon: Icon }, i) => (
            <div key={step} className="flow-step">
              <div className="flow-step-number">{step}</div>
              <div className="flow-step-line" />
              <div className="glass-card flow-step-card">
                <Icon size={20} style={{ color: 'var(--accent-blue)', flexShrink: 0 }} />
                <div>
                  <h4>{title}</h4>
                  <p>{desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="about-section animate-in animate-delay-3">
        <h2 className="section-heading">Teknik Stack</h2>
        <div className="tech-grid">
          {techStack.map(({ icon: Icon, name, desc, color }) => (
            <div key={name} className="glass-card tech-card">
              <div className="tech-card-icon" style={{ background: `${color}18`, color }}>
                <Icon size={20} />
              </div>
              <h4>{name}</h4>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>
      {/* Animated Architecture */}
      <section className="about-section animate-in animate-delay-4">
        <h2 className="section-heading">Canlı Mimari ve Veri Akışı</h2>
        <AnimatedDataJourney />
      </section>

      {/* API Endpoints */}
      <section className="about-section animate-in animate-delay-4">
        <h2 className="section-heading">API Endpoints</h2>
        <div className="glass-card" style={{ padding: '20px 24px', overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr><th>Metot</th><th>Endpoint</th><th>Açıklama</th></tr>
            </thead>
            <tbody>
              <tr><td><span className="badge badge-green">GET</span></td><td className="hash-cell">/api/sensor-data</td><td>Tüm sensör verilerini getir</td></tr>
              <tr><td><span className="badge badge-green">GET</span></td><td className="hash-cell">/api/sensor-data/{'{id}'}</td><td>ID ile veri getir</td></tr>
              <tr><td><span className="badge badge-green">GET</span></td><td className="hash-cell">/api/sensor-data/device/{'{deviceId}'}</td><td>Cihaza göre filtrele</td></tr>
              <tr><td><span className="badge badge-blue">POST</span></td><td className="hash-cell">/api/sensor-data</td><td>Yeni sensör verisi oluştur</td></tr>
              <tr><td><span className="badge badge-blue">POST</span></td><td className="hash-cell">/api/sensor-data/{'{id}'}/verify</td><td>Hash doğrulama</td></tr>
              <tr><td><span className="badge badge-green">GET</span></td><td className="hash-cell">/api/sensor-data/{'{id}'}/verify-local</td><td>Yerel bütünlük kontrolü</td></tr>
              <tr><td><span className="badge badge-blue">POST</span></td><td className="hash-cell">/api/sensor-data/{'{id}'}/verify-blockchain</td><td>Blockchain doğrulama</td></tr>
              <tr><td><span className="badge badge-green">GET</span></td><td className="hash-cell">/api/sensor-data/{'{id}'}/blockchain-record</td><td>Blockchain kaydını getir</td></tr>
              <tr><td><span className="badge badge-green">GET</span></td><td className="hash-cell">/api/sensor-data/{'{id}'}/blockchain-history</td><td>Blockchain geçmişi</td></tr>
              <tr><td><span className="badge badge-green">GET</span></td><td className="hash-cell">/api/sensor-data/health</td><td>Sistem sağlık kontrolü</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <footer className="about-footer animate-in">
        <p>IoT Data Integrity Chain — Blockchain destekli IoT veri güvenliği platformu</p>
      </footer>
    </div>
  );
}
