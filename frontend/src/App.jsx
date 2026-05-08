import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';
import Integrity from './pages/Integrity';
import Blocks from './pages/Blocks';
import About from './pages/About';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/blocks" element={<Blocks />} />
            <Route path="/devices" element={<Devices />} />
            <Route path="/integrity" element={<Integrity />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
