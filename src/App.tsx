import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.tsx';
import Sidebar from './components/Sidebar.tsx';
import VideoGrid from './components/VideoGrid.tsx';
import WatchPage from './components/WatchPage.tsx';
import UploadDashboard from './components/UploadDashboard.tsx';
import SettingsPanel from './components/SettingsPanel.tsx';
import Shorts from './components/Shorts.tsx';
import Library from './components/Library.tsx';
import MiniPlayer from './components/MiniPlayer.tsx';
import HistoryPage from './components/HistoryPage.tsx';
import LikedVideosPage from './components/LikedVideosPage.tsx';
import SubscriptionsPage from './components/SubscriptionsPage.tsx';
import ChannelPage from './components/ChannelPage.tsx';
import PlaylistPage from './components/PlaylistPage.tsx';
import SearchPage from './components/SearchPage.tsx';

const MainLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1300);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [miniPlayerVideoId, setMiniPlayerVideoId] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (window.innerWidth <= 1300) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on navigation on mobile
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  useEffect(() => {
    const handleSetMiniPlayer = (e: any) => {
      setMiniPlayerVideoId(e.detail);
    };
    window.addEventListener('setMiniPlayer', handleSetMiniPlayer);
    return () => window.removeEventListener('setMiniPlayer', handleSetMiniPlayer);
  }, []);

  const showSidebar = !location.pathname.startsWith('/watch') && !location.pathname.startsWith('/shorts');

  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="main-layout" style={{ display: 'flex', marginTop: '70px', flex: 1 }}>
        <Sidebar isOpen={isSidebarOpen} />

        {/* Overlay for mobile sidebar */}
        {isMobile && isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 998, backdropFilter: 'blur(4px)' }}
          />
        )}

        <main style={{
          flex: 1,
          padding: isMobile ? '10px' : '20px',
          marginLeft: (isSidebarOpen && !isMobile && showSidebar) ? '240px' : '0',
          transition: 'margin-left 0.3s ease',
          minHeight: 'calc(100vh - 70px)',
          width: '100%'
        }}>
          <Routes>
            <Route path="/" element={<VideoGrid />} />
            <Route path="/watch/:id" element={<WatchPage />} />
            <Route path="/upload" element={<UploadDashboard />} />
            <Route path="/settings" element={<SettingsPanel />} />
            <Route path="/shorts" element={<Shorts />} />
            <Route path="/library" element={<Library />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/liked-videos" element={<LikedVideosPage />} />
            <Route path="/subscriptions" element={<SubscriptionsPage />} />
            <Route path="/channel/:channelId" element={<ChannelPage />} />
            <Route path="/playlist/:playlistId" element={<PlaylistPage />} />
            <Route path="/search" element={<SearchPage />} />
          </Routes>
        </main>
      </div>
      {miniPlayerVideoId && (
        <MiniPlayer
          videoId={miniPlayerVideoId}
          onClose={() => setMiniPlayerVideoId(null)}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
};

export default App;
