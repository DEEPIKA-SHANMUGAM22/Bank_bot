import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, LayoutDashboard, Landmark } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { useTheme } from '../../hooks/useTheme';
import { useChatHistory } from '../../hooks/useChatHistory';
import { getHealth } from '../../services/api';

import Header from '../../components/Header/Header';
import ChatWindow from '../../components/Chat/ChatWindow';
import ChatHistoryPanel from '../../components/Sidebar/ChatHistoryPanel';

export default function Chat() {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { sessions, saveSession, renameSession, deleteSession, clearAll } = useChatHistory();

  const { messages, isLoading, sendChat, suggestFaq, startNewSession, loadSession, sessionId } =
    useChat({
      onMessagesChange: (sid, msgs) => {
        if (msgs.length > 0) saveSession(sid, msgs);
      },
    });

  const [isConnected, setIsConnected] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState(sessionId);

  // Health check every 30s
  useEffect(() => {
    const check = async () => {
      try {
        await getHealth();
        setIsConnected(true);
      } catch {
        setIsConnected(false);
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  /** Switch to a past session */
  const handleSelectSession = useCallback(
    (sid, savedMessages) => {
      setActiveSessionId(sid);
      loadSession(sid, savedMessages);
    },
    [loadSession]
  );

  /** Start a fresh conversation */
  const handleNewChat = useCallback(() => {
    startNewSession();
    setActiveSessionId(sessionId);
  }, [startNewSession, sessionId]);

  const handleDeleteSession = useCallback(
    (sid) => {
      deleteSession(sid);
      if (sid === activeSessionId) {
        handleNewChat();
      }
    },
    [deleteSession, activeSessionId, handleNewChat]
  );

  const handleClearHistory = useCallback(() => {
    clearAll();
    handleNewChat();
  }, [clearAll, handleNewChat]);

  return (
    <div className="app-layout">
      {/* Customer Sidebar Navigation - Chat History ONLY */}
      <aside className="sidebar">
        {/* Logo and Switch to Admin */}
        <div
          style={{
            padding: '18px 14px 14px',
            borderBottom: '1px solid var(--border)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(59,130,246,0.4)',
              }}
            >
              <Landmark size={22} color="#fff" />
            </div>
            <div>
              <p style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.3px' }}>
                BankAssist
              </p>
              <p style={{ fontSize: '0.65rem', color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                AI Powered
              </p>
            </div>
          </div>

          {/* Quick link to admin dashboard */}
          <button
            onClick={() => navigate('/admin')}
            style={{
              width: '100%',
              background: 'rgba(16,185,129,0.12)',
              border: '1px solid rgba(16,185,129,0.25)',
              color: '#10b981',
              borderRadius: '10px',
              padding: '9px 12px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#10b981';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(16,185,129,0.12)';
              e.currentTarget.style.color = '#10b981';
            }}
          >
            <LayoutDashboard size={14} />
            Admin Dashboard
          </button>
        </div>

        {/* Scrollable list of chat sessions */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <ChatHistoryPanel
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={handleSelectSession}
            onNewChat={handleNewChat}
            onDeleteSession={handleDeleteSession}
            onRenameSession={renameSession}
            onClearAll={handleClearHistory}
          />
        </div>
      </aside>

      {/* Main chat interface */}
      <div className="main-content">
        <Header isDark={isDark} onToggleTheme={toggleTheme} isConnected={isConnected} />
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          onSend={sendChat}
          onSuggestFaq={suggestFaq}
        />
      </div>
    </div>
  );
}
