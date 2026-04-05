import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home as HomeIcon, Search, LayoutDashboard, GitCompare, Menu, X, Car, Star, Sun, Moon } from 'lucide-react';
import Home from './pages/Home';
import Recommend from './pages/Recommend';
import Compare from './pages/Compare';
import Analytics from './pages/Analytics';
import Explore from './pages/Explore';
import CarDetails from './pages/CarDetails';
import AIChatBot from './components/AIChatBot';
import { useEffect } from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div style={{paddingTop: '100px', color: 'red', textAlign: 'center'}}><h2>Something went wrong.</h2><pre>{this.state.error?.toString()}</pre></div>;
    }
    return this.props.children;
  }
}

const Navbar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
    }
  }, [isDarkMode]);

  const navItems = [
    { name: 'Home', path: '/', icon: HomeIcon },
    { name: 'Explore', path: '/explore', icon: Search },
    { name: 'AI Recommendation', path: '/recommend', icon: Star },
    { name: 'Vehicle Compare', path: '/compare', icon: GitCompare },
    { name: 'Analytics', path: '/analytics', icon: LayoutDashboard },
  ];

  return (
    <nav className="glass">
      <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', fontWeight: 800 }}>
        <div style={{ padding: '8px', background: 'var(--gradient)', borderRadius: '12px', display: 'flex' }}>
          <Car size={24} color="#fff" />
        </div>
        <span style={{ 
          background: isDarkMode ? 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)' : 'none', 
          color: isDarkMode ? 'transparent' : 'var(--foreground)',
          WebkitBackgroundClip: isDarkMode ? 'text' : 'unset', 
          backgroundClip: isDarkMode ? 'text' : 'unset',
          WebkitTextFillColor: isDarkMode ? 'transparent' : 'var(--foreground)', 
          letterSpacing: '-0.02em' 
        }}>
          ZENITH AUTO
        </span>
      </div>
      <div className="nav-links">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.9rem' }}
          >
            <item.icon size={16} color={location.pathname === item.path ? '#6366f1' : 'inherit'} />
            {item.name}
          </Link>
        ))}
      </div>
      <button 
        className="btn btn-secondary theme-toggle" 
        onClick={() => setIsDarkMode(!isDarkMode)} 
        style={{ 
          borderRadius: '12px', 
          padding: '10px',
          width: '42px',
          height: '42px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
          border: '1px solid var(--border)'
        }}
        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {isDarkMode ? <Sun size={20} color="#fbbf24" /> : <Moon size={20} color="#6366f1" />}
      </button>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/recommend" element={<Recommend />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/car/:id" element={<CarDetails />} />
          </Routes>
        </ErrorBoundary>
        <AIChatBot />
      </div>
    </Router>
  );
}

export default App;
