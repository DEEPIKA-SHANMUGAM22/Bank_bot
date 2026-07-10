import { Landmark, Upload as UploadIcon } from 'lucide-react';
import DocumentList from './DocumentList';
import ChatHistoryPanel from './ChatHistoryPanel';

export default function Sidebar({
  documents,
  isLoadingDocs,
  onRefreshDocs,
  onDeleteDoc,
  onOpenUpload,
  // Chat history props
  chatSessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  onClearHistory,
}) {
  return (
    <aside className="sidebar">
      {/* ── Logo + Upload ─────────────────────────────── */}
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

        <button
          onClick={onOpenUpload}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            padding: '9px 12px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(59,130,246,0.5)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(59,130,246,0.3)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <UploadIcon size={15} />
          Upload Documents
        </button>
      </div>

      {/* ── Knowledge Base Document List ──────────────── */}
      <DocumentList
        documents={documents}
        isLoading={isLoadingDocs}
        onRefresh={onRefreshDocs}
        onDelete={onDeleteDoc}
      />

      {/* ── Chat History Panel ────────────────────────── */}
      <ChatHistoryPanel
        sessions={chatSessions}
        activeSessionId={activeSessionId}
        onSelectSession={onSelectSession}
        onNewChat={onNewChat}
        onDeleteSession={onDeleteSession}
        onRenameSession={onRenameSession}
        onClearAll={onClearHistory}
      />
    </aside>
  );
}
