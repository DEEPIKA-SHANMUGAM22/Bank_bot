import { useEffect } from 'react';
import { Database, RefreshCw, Loader2 } from 'lucide-react';
import DocumentItem from './DocumentItem';

export default function DocumentList({ documents, isLoading, onRefresh, onDelete }) {
  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 14px 8px',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Database size={14} style={{ color: 'var(--accent)' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Knowledge Base
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontSize: '0.7rem',
              background: 'var(--accent)',
              color: '#fff',
              borderRadius: '20px',
              padding: '1px 8px',
              fontWeight: 600,
            }}
          >
            {documents.length}
          </span>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '3px',
              borderRadius: '5px',
              display: 'flex',
            }}
            title="Refresh documents"
          >
            <RefreshCw
              size={13}
              style={{
                animation: isLoading ? 'spin 1s linear infinite' : 'none',
              }}
            />
          </button>
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px 10px' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
            <Loader2
              size={20}
              style={{ color: 'var(--accent)', animation: 'spin 1s linear infinite' }}
            />
          </div>
        ) : documents.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '24px 12px',
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
            }}
          >
            <Database size={28} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
            <p>No documents uploaded yet.</p>
            <p style={{ marginTop: '4px', opacity: 0.7 }}>Upload files to get started.</p>
          </div>
        ) : (
          documents.map((doc) => (
            <DocumentItem key={doc.doc_id} doc={doc} onDelete={onDelete} />
          ))
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
