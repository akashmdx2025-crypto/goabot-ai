import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const pageTitles = {
  '/': { title: 'Dashboard', subtitle: 'Overview of your business activity' },
  '/bookings': { title: 'Bookings', subtitle: 'Manage table reservations' },
  '/menu': { title: 'Menu Manager', subtitle: 'Update your restaurant menu' },
  '/settings': { title: 'Settings', subtitle: 'Configure your business & WhatsApp' },
  '/reviews': { title: 'Review Responder', subtitle: 'AI-powered review replies' },
};

export default function Header() {
  const location = useLocation();
  const { business } = useAuth();
  const page = pageTitles[location.pathname] || { title: 'GoaBot AI', subtitle: '' };

  return (
    <header className="header" id="page-header">
      <div className="header-title">
        <h2>{page.title}</h2>
        <p>{page.subtitle}</p>
      </div>
      <div className="header-actions">
        {business?.chatbotEnabled !== undefined && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0.4rem 1rem',
            background: business.chatbotEnabled
              ? 'rgba(34, 197, 94, 0.1)'
              : 'rgba(239, 68, 68, 0.1)',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: business.chatbotEnabled ? 'var(--color-success)' : 'var(--color-error)',
          }}>
            <span style={{
              width: 8, height: 8,
              borderRadius: '50%',
              background: business.chatbotEnabled ? 'var(--color-success)' : 'var(--color-error)',
              animation: business.chatbotEnabled ? 'pulse 2s infinite' : 'none',
            }} />
            Bot {business.chatbotEnabled ? 'Active' : 'Paused'}
          </div>
        )}
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </header>
  );
}
