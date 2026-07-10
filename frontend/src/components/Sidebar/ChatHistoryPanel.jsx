import { MessageSquare, Trash2, Plus, Clock, ChevronDown, ChevronRight, Pencil, Check, X } from 'lucide-react';
import { useState, useRef, useCallback } from 'react';

function formatRelativeTime(isoStr) {
  const now = new Date();
  const then = new Date(isoStr);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function SessionItem({ session, isActive, onClick, onDelete, onRename }) {
  const [hovered, setHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(session.title);
  const inputRef = useRef(null);

  const startEdit = useCallback(
    (e) => {
      e.stopPropagation();
      setEditValue(session.title);
      setIsEditing(true);
      // Focus input on next frame after render
      setTimeout(() => inputRef.current?.focus(), 0);
    },
    [session.title]
  );

  const commitEdit = useCallback(() => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== session.title) {
      onRename(session.sessionId, trimmed);
    }
    setIsEditing(false);
  }, [editValue, session.title, session.sessionId, onRename]);

  const cancelEdit = useCallback(() => {
    setEditValue(session.title);
    setIsEditing(false);
  }, [session.title]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); commitEdit(); }
    if (e.key === 'Escape') { e.preventDefault(); cancelEdit(); }
  };

  return (
    <div
      onClick={() => !isEditing && onClick(session)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onDoubleClick={startEdit}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 10px',
        borderRadius: '9px',
        cursor: isEditing ? 'default' : 'pointer',
        marginBottom: '2px',
        background: isActive
          ? 'rgba(59,130,246,0.15)'
          : hovered
          ? 'rgba(255,255,255,0.05)'
          : 'transparent',
        border: isActive ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
        transition: 'all 0.15s ease',
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '8px',
          background: isActive ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <MessageSquare size={13} color={isActive ? 'var(--accent)' : 'var(--text-muted)'} />
      </div>

      {/* Title / Edit input */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {isEditing ? (
          <input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={commitEdit}
            onClick={(e) => e.stopPropagation()}
            maxLength={80}
            style={{
              width: '100%',
              background: 'var(--bg)',
              border: '1px solid var(--accent)',
              borderRadius: '5px',
              color: 'var(--text)',
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '2px 6px',
              outline: 'none',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          />
        ) : (
          <>
            <p
              style={{
                fontSize: '0.75rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--accent)' : 'var(--text)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: 1.3,
              }}
            >
              {session.title}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <Clock size={9} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                {formatRelativeTime(session.timestamp)}
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: '4px' }}>
                · {Math.floor((session.messageCount || 0) / 2)} Q&amp;A
              </span>
            </div>
          </>
        )}
      </div>

      {/* Action buttons */}
      {isEditing ? (
        /* Commit / Cancel buttons while editing */
        <div style={{ display: 'flex', gap: '3px', flexShrink: 0 }}>
          <button
            onMouseDown={(e) => { e.preventDefault(); commitEdit(); }}
            style={{
              background: 'rgba(34,197,94,0.15)',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              color: '#22c55e',
              padding: '3px 5px',
              display: 'flex',
            }}
            title="Save (Enter)"
          >
            <Check size={12} />
          </button>
          <button
            onMouseDown={(e) => { e.preventDefault(); cancelEdit(); }}
            style={{
              background: 'rgba(239,68,68,0.12)',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              color: '#ef4444',
              padding: '3px 5px',
              display: 'flex',
            }}
            title="Cancel (Esc)"
          >
            <X size={12} />
          </button>
        </div>
      ) : hovered ? (
        /* Rename + Delete on hover */
        <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
          <button
            onClick={startEdit}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '3px',
              borderRadius: '5px',
              display: 'flex',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            title="Rename (or double-click)"
          >
            <Pencil size={11} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(session.sessionId); }}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '3px',
              borderRadius: '5px',
              display: 'flex',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            title="Delete this chat"
          >
            <Trash2 size={11} />
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function ChatHistoryPanel({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  onClearAll,
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      style={{
        borderTop: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: collapsed ? 'auto' : '300px',
        flexShrink: 0,
      }}
    >
      {/* ── Header ─────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px 8px',
          flexShrink: 0,
        }}
      >
        {/* Left: toggle collapse + label */}
        <button
          onClick={() => setCollapsed((p) => !p)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          {collapsed ? (
            <ChevronRight size={13} style={{ color: 'var(--text-muted)' }} />
          ) : (
            <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />
          )}
          <MessageSquare size={13} style={{ color: 'var(--accent)' }} />
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Chat History
          </span>
          {sessions.length > 0 && (
            <span
              style={{
                fontSize: '0.65rem',
                background: 'var(--accent)',
                color: '#fff',
                borderRadius: '20px',
                padding: '1px 7px',
                fontWeight: 600,
              }}
            >
              {sessions.length}
            </span>
          )}
        </button>

        {/* Right: new chat + clear all */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <button
            onClick={onNewChat}
            title="New chat"
            style={{
              background: 'rgba(59,130,246,0.12)',
              border: '1px solid rgba(59,130,246,0.25)',
              borderRadius: '7px',
              padding: '4px 8px',
              cursor: 'pointer',
              color: 'var(--accent)',
              fontSize: '0.68rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(59,130,246,0.12)';
              e.currentTarget.style.color = 'var(--accent)';
            }}
          >
            <Plus size={11} />
            New
          </button>

          {sessions.length > 0 && !collapsed && (
            <button
              onClick={onClearAll}
              title="Clear all history"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: '4px',
                borderRadius: '6px',
                display: 'flex',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

      {/* ── Session List ───────────────────────────── */}
      {!collapsed && (
        <div style={{ overflowY: 'auto', padding: '0 8px 10px', flex: 1 }}>
          {sessions.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '16px 12px',
                color: 'var(--text-muted)',
                fontSize: '0.72rem',
              }}
            >
              <MessageSquare size={22} style={{ margin: '0 auto 6px', opacity: 0.3 }} />
              <p>No chat history yet.</p>
              <p style={{ opacity: 0.6, marginTop: '2px' }}>Conversations save automatically.</p>
            </div>
          ) : (
            sessions.map((session) => (
              <SessionItem
                key={session.sessionId}
                session={session}
                isActive={session.sessionId === activeSessionId}
                onClick={(s) => onSelectSession(s.sessionId, s.messages)}
                onDelete={onDeleteSession}
                onRename={onRenameSession}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
