// Main Application - Routing, Layout, Navigation
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AuthProvider, useAuth, AuthWrapper } from './features/auth';
import { Spinner, Button } from './components/ui';

// ==================== ERROR BOUNDARY ====================
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error('Error caught by boundary:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            textAlign: 'center',
            maxWidth: '500px'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>⚠️</div>
            <h1 style={{ 
              margin: '0 0 12px', 
              fontSize: '24px',
              color: '#111827'
            }}>
              Bir Hata Oluştu
            </h1>
            <p style={{ 
              color: '#6B7280', 
              marginBottom: '24px' 
            }}>
              Beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.
            </p>
            {this.state.error && (
              <details style={{
                textAlign: 'left',
                background: '#F9FAFB',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <summary style={{ cursor: 'pointer', color: '#374151' }}>
                  Hata Detayları
                </summary>
                <pre style={{
                  fontSize: '12px',
                  color: '#991B1B',
                  overflow: 'auto',
                  marginTop: '12px'
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <Button onClick={() => window.location.reload()}>
              Sayfayı Yenile
            </Button>
          </div>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// ==================== LOADING FALLBACK ====================
function LoadingFallback() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '300px'
    }}>
      <Spinner size="lg" />
    </div>
  );
}

// ==================== SIDEBAR NAVIGATION ====================
function Sidebar({ currentPage, onNavigate, collapsed, onToggleCollapse }) {
  const { user, profile, signOut } = useAuth();
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'customers', label: 'Müşteriler', icon: '👥' },
    { id: 'visa', label: 'Vize İşlemleri', icon: '📋' },
    { id: 'tours', label: 'Turlar', icon: '✈️' },
    { id: 'hotels', label: 'Otel Rezervasyonları', icon: '🏨' },
    { id: 'settings', label: 'Ayarlar', icon: '⚙️' }
  ];
  
  const sidebarWidth = collapsed ? '70px' : '260px';
  
  return (
    <aside style={{
      width: sidebarWidth,
      height: '100vh',
      background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.3s ease',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? '20px 10px' : '24px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between'
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '28px' }}>✈️</div>
            <div>
              <div style={{ 
                color: 'white', 
                fontWeight: '700', 
                fontSize: '18px' 
              }}>
                Paydos CRM
              </div>
              <div style={{ 
                color: '#94A3B8', 
                fontSize: '11px' 
              }}>
                Turizm Yönetimi
              </div>
            </div>
          </div>
        )}
        {collapsed && <div style={{ fontSize: '28px' }}>✈️</div>}
        <button
          onClick={onToggleCollapse}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            padding: '6px 8px',
            cursor: 'pointer',
            display: collapsed ? 'none' : 'block'
          }}
        >
          ◀
        </button>
      </div>
      
      {/* Menu Items */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        {menuItems.map(item => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={collapsed ? item.label : undefined}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: collapsed ? '14px' : '12px 16px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                marginBottom: '4px',
                background: isActive 
                  ? 'linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%)' 
                  : 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: isActive ? 'white' : '#94A3B8',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '14px',
                fontWeight: isActive ? '600' : '400'
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.color = 'white';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#94A3B8';
                }
              }}
            >
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>
      
      {/* User Section */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        {!collapsed && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '600'
            }}>
              {(profile?.name || user?.email || '?')[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {profile?.name || 'Kullanıcı'}
              </div>
              <div style={{
                color: '#94A3B8',
                fontSize: '12px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {user?.email}
              </div>
            </div>
          </div>
        )}
        
        <button
          onClick={signOut}
          title="Çıkış Yap"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: collapsed ? '12px' : '10px 16px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            background: 'rgba(239, 68, 68, 0.2)',
            border: 'none',
            borderRadius: '8px',
            color: '#FCA5A5',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
          }}
        >
          <span>🚪</span>
          {!collapsed && <span>Çıkış Yap</span>}
        </button>
      </div>
      
      {/* Collapse button when collapsed */}
      {collapsed && (
        <button
          onClick={onToggleCollapse}
          style={{
            position: 'absolute',
            top: '50%',
            right: '-12px',
            transform: 'translateY(-50%)',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: '#6366F1',
            border: '2px solid white',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}
        >
          ▶
        </button>
      )}
    </aside>
  );
}

// ==================== TOP HEADER ====================
function TopHeader({ title }) {
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <header style={{
      height: '64px',
      background: 'white',
      borderBottom: '1px solid #E5E7EB',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <h1 style={{ 
        margin: 0, 
        fontSize: '20px', 
        fontWeight: '600',
        color: '#111827'
      }}>
        {title}
      </h1>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Search */}
        <div style={{
          position: 'relative',
          width: '300px'
        }}>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Ara..."
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={e => e.target.style.borderColor = '#6366F1'}
            onBlur={e => e.target.style.borderColor = '#E5E7EB'}
          />
          <span style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#9CA3AF'
          }}>
            🔍
          </span>
        </div>
        
        {/* Notifications */}
        <button style={{
          position: 'relative',
          background: 'none',
          border: 'none',
          fontSize: '20px',
          cursor: 'pointer',
          padding: '8px'
        }}>
          🔔
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            width: '8px',
            height: '8px',
            background: '#EF4444',
            borderRadius: '50%'
          }} />
        </button>
      </div>
    </header>
  );
}

// ==================== MAIN LAYOUT ====================
function MainLayout({ children, currentPage, onNavigate }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const pageTitles = {
    dashboard: 'Dashboard',
    customers: 'Müşteriler',
    visa: 'Vize İşlemleri',
    tours: 'Turlar',
    hotels: 'Otel Rezervasyonları',
    settings: 'Ayarlar'
  };
  
  const sidebarWidth = sidebarCollapsed ? 70 : 260;
  
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F9FAFB' }}>
      <Sidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <main style={{
        flex: 1,
        marginLeft: `${sidebarWidth}px`,
        transition: 'margin-left 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh'
      }}>
        <TopHeader title={pageTitles[currentPage] || 'Paydos CRM'} />
        
        <div style={{ flex: 1, overflow: 'auto' }}>
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
              {children}
            </Suspense>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}

// ==================== PAGE ROUTER (Simple) ====================
// Lazy load pages for better performance
const DashboardPage = lazy(() => import('./features/dashboard').then(m => ({ default: m.DashboardPage })));
const CustomersPage = lazy(() => import('./features/customers').then(m => ({ default: m.CustomersPage })));
const VisaPage = lazy(() => import('./features/visa').then(m => ({ default: m.VisaPage })));
const ToursPage = lazy(() => import('./features/tours').then(m => ({ default: m.ToursPage })));
const HotelsPage = lazy(() => import('./features/hotels').then(m => ({ default: m.HotelsPage })));
const SettingsPage = lazy(() => import('./features/settings').then(m => ({ default: m.SettingsPage })));

function PageRouter({ currentPage }) {
  switch (currentPage) {
    case 'customers':
      return <CustomersPage />;
    case 'visa':
      return <VisaPage />;
    case 'tours':
      return <ToursPage />;
    case 'hotels':
      return <HotelsPage />;
    case 'settings':
      return <SettingsPage />;
    case 'dashboard':
    default:
      return <DashboardPage />;
  }
}

// ==================== MAIN APP CONTENT ====================
function AppContent() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  
  // Simple URL-based navigation (without react-router)
  useEffect(() => {
    // Parse initial page from hash
    const hash = window.location.hash.replace('#/', '');
    if (hash && ['dashboard', 'customers', 'visa', 'tours', 'hotels', 'settings'].includes(hash)) {
      setCurrentPage(hash);
    }
    
    // Listen for hash changes
    const handleHashChange = () => {
      const newHash = window.location.hash.replace('#/', '');
      if (newHash && ['dashboard', 'customers', 'visa', 'tours', 'hotels', 'settings'].includes(newHash)) {
        setCurrentPage(newHash);
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  function handleNavigate(page) {
    setCurrentPage(page);
    window.location.hash = `/${page}`;
  }
  
  return (
    <MainLayout currentPage={currentPage} onNavigate={handleNavigate}>
      <PageRouter currentPage={currentPage} />
    </MainLayout>
  );
}

// ==================== ROOT APP ====================
export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AuthWrapper>
          <AppContent />
        </AuthWrapper>
      </AuthProvider>
    </ErrorBoundary>
  );
}

// ==================== GLOBAL STYLES INJECTION ====================
// Inject base styles
if (typeof document !== 'undefined') {
  const styleId = 'paydos-crm-global-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      * {
        box-sizing: border-box;
      }
      
      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        background: #F9FAFB;
        color: #111827;
      }
      
      input, button, textarea, select {
        font-family: inherit;
      }
      
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      
      ::-webkit-scrollbar-track {
        background: #F3F4F6;
        border-radius: 4px;
      }
      
      ::-webkit-scrollbar-thumb {
        background: #D1D5DB;
        border-radius: 4px;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: #9CA3AF;
      }
      
      /* Toast animations */
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
      
      /* Focus visible */
      :focus-visible {
        outline: 2px solid #6366F1;
        outline-offset: 2px;
      }
      
      /* Selection */
      ::selection {
        background: #C7D2FE;
        color: #312E81;
      }
    `;
    document.head.appendChild(style);
  }
}
