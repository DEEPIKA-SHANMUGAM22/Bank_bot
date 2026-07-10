import { Landmark, Wifi, WifiOff } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Header({ isDark, onToggleTheme, isConnected }) {
  return (
    <header className="app-header">
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(59,130,246,0.4)',
          }}
        >
          <Landmark size={20} color="#fff" />
        </div>
        <div>
          <h1
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--text)',
              letterSpacing: '-0.3px',
              lineHeight: 1.2,
            }}
          >
            BankAssist AI
          </h1>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1 }}>
            RAG-Powered Banking Assistant
          </p>
        </div>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Connection status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            color: isConnected ? '#22c55e' : '#ef4444',
            fontWeight: 500,
          }}
        >
          {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
          {isConnected ? 'Connected' : 'Offline'}
        </div>
        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
      </div>
    </header>
  );
}
