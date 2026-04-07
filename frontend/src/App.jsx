import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Bookings from './pages/Bookings';
import MenuManager from './pages/MenuManager';
import BusinessSettings from './pages/BusinessSettings';
import ReviewResponder from './pages/ReviewResponder';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import './index.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;
  return children;
}

function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/menu" element={<MenuManager />} />
          <Route path="/settings" element={<BusinessSettings />} />
          <Route path="/reviews" element={<ReviewResponder />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1A1F35',
              color: '#F1F5F9',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              fontSize: '0.875rem',
            },
            success: {
              iconTheme: {
                primary: '#00C9A7',
                secondary: '#0A0E1A',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#0A0E1A',
              },
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
