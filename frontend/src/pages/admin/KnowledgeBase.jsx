import { FileText, Trash2, FileSpreadsheet, FileType, RefreshCw } from 'lucide-react';

const FILE_ICONS = {
  '.pdf': { icon: FileText, color: '#ef4444' },
  '.docx': { icon: FileText, color: '#3b82f6' },
  '.doc': { icon: FileText, color: '#3b82f6' },
  '.txt': { icon: FileType, color: '#22c55e' },
  '.csv': { icon: FileSpreadsheet, color: '#10b981' },
  '.xlsx': { icon: FileSpreadsheet, color: '#f59e0b' },
  '.xls': { icon: FileSpreadsheet, color: '#f59e0b' },
};

function formatBytes(bytes) {
  if (!bytes) return '';
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function formatDate(isoStr) {
  if (!isoStr) return '';
  return new Date(isoStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function KnowledgeBase({ documents, isLoading, onRefresh, onDelete }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>
            Knowledge Base Documents
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Manage the primary files that BankAssist AI queries for RAG context.
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '8px 14px',
            color: 'var(--text)',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
          }}
        >
          <RefreshCw size={14} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        {documents.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <FileText size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>No documents uploaded</h3>
            <p style={{ fontSize: '0.8rem' }}>Upload files from the "Upload Documents" tab to start building the KB.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontWeight: 600 }}>
                  <th style={{ padding: '14px 16px' }}>Document Name</th>
                  <th style={{ padding: '14px 16px' }}>Type</th>
                  <th style={{ padding: '14px 16px' }}>File Size</th>
                  <th style={{ padding: '14px 16px' }}>Uploaded At</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => {
                  const ext = doc.file_type || '.txt';
                  const { icon: Icon, color } = FILE_ICONS[ext] || { icon: FileText, color: '#94a3b8' };

                  return (
                    <tr
                      key={doc.doc_id}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        transition: 'background 0.2s ease',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: `${color}18`, display: 'flex', alignItems: 'center', justifycontent: 'center', flexShrink: 0, justifyContent: 'center' }}>
                            <Icon size={14} color={color} />
                          </div>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
                            {doc.filename}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                        {ext.toUpperCase().substring(1)}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                        {formatBytes(doc.file_size_bytes)}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                        {formatDate(doc.upload_timestamp)}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button
                          onClick={() => onDelete(doc.doc_id)}
                          style={{
                            background: 'transparent',
                            border: '1px solid transparent',
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
                            padding: '6px',
                            borderRadius: '8px',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#ef4444';
                            e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--text-muted)';
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderColor = 'transparent';
                          }}
                          title="Delete document"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
