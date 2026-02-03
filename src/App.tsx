import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.tsx';
import Sidebar from './components/Sidebar.tsx';
import VideoGrid from './components/VideoGrid.tsx';
import WatchPage from './components/WatchPage.tsx';
import UploadDashboard from './components/UploadDashboard.tsx';
import SettingsPanel from './components/SettingsPanel.tsx';
import Shorts from './components/Shorts.tsx';
import Library from './components/Library.tsx';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <Router>
      <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="main-layout" style={{ display: 'flex', marginTop: '70px', flex: 1 }}>
          <Sidebar isOpen={isSidebarOpen} />
          <main style={{
            flex: 1,
            padding: '20px',
            marginLeft: isSidebarOpen ? '240px' : '0',
            transition: 'margin-left 0.3s ease',
            minHeight: 'calc(100vh - 70px)'
          }}>
            <Routes>
              <Route path="/" element={<VideoGrid />} />
              <Route path="/watch/:id" element={<WatchPage />} />
              <Route path="/upload" element={<UploadDashboard />} />
              <Route path="/settings" element={<SettingsPanel />} />
              <Route path="/shorts" element={<Shorts />} />
              <Route path="/library" element={<Library />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
