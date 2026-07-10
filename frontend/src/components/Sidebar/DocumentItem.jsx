import { FileText, Trash2, FileSpreadsheet, FileType } from 'lucide-react';

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
  });
}

export default function DocumentItem({ doc, onDelete }) {
  const ext = doc.file_type || '.txt';
  const { icon: Icon, color } = FILE_ICONS[ext] || { icon: FileText, color: '#94a3b8' };

  return (
    <div
      className="slide-up"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        padding: '10px',
        borderRadius: '10px',
        border: '1px solid var(--border)',
        background: 'var(--card)',
        marginBottom: '8px',
        transition: 'all 0.2s ease',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent)';
        e.currentTarget.style.background = 'rgba(59,130,246,0.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.background = 'var(--card)';
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: `${color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={16} color={color} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: '0.78rem',
            fontWeight: 600,
            color: 'var(--text)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={doc.filename}
        >
          {doc.filename}
        </p>
        <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          {formatDate(doc.upload_timestamp)}
          {doc.file_size_bytes ? ` · ${formatBytes(doc.file_size_bytes)}` : ''}
          {doc.page_count ? ` · ${doc.page_count}p` : ''}
        </p>
      </div>

      {/* Delete */}
      <button
        onClick={() => onDelete(doc.doc_id)}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          padding: '4px',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#ef4444';
          e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-muted)';
          e.currentTarget.style.background = 'transparent';
        }}
        title="Delete document"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
