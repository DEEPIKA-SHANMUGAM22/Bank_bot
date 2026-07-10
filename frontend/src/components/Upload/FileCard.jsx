import { FileText, CheckCircle2, XCircle, Loader2, X, AlertCircle } from 'lucide-react';

function formatBytes(bytes) {
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

const STATUS_CONFIG = {
  pending: { icon: FileText, color: 'var(--text-muted)', label: 'Pending' },
  uploading: { icon: Loader2, color: 'var(--accent)', label: 'Uploading...' },
  success: { icon: CheckCircle2, color: '#22c55e', label: 'Uploaded' },
  error: { icon: XCircle, color: '#ef4444', label: 'Failed' },
  duplicate: { icon: AlertCircle, color: '#f59e0b', label: 'Duplicate' },
};

export default function FileCard({ file, status, progress, errorMessage, onRemove }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;
  const isSpinning = status === 'uploading';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 12px',
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        marginBottom: '8px',
        animation: 'slideUp 0.2s ease-out',
      }}
    >
      {/* Status icon */}
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: `${config.color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon
          size={16}
          color={config.color}
          style={{ animation: isSpinning ? 'spin 1s linear infinite' : 'none' }}
        />
      </div>

      {/* File info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--text)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={file.name}
        >
          {file.name}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            {formatBytes(file.size)}
          </span>
          <span style={{ fontSize: '0.68rem', color: config.color, fontWeight: 600 }}>
            {errorMessage || config.label}
          </span>
        </div>

        {/* Progress bar */}
        {status === 'uploading' && (
          <div className="progress-bar-track" style={{ marginTop: '5px' }}>
            <div
              className="progress-bar-fill"
              style={{ width: `${progress || 0}%`, background: 'var(--accent)' }}
            />
          </div>
        )}
      </div>

      {/* Remove button */}
      {status !== 'uploading' && (
        <button
          onClick={() => onRemove(file)}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            padding: '4px',
            borderRadius: '6px',
            display: 'flex',
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
        >
          <X size={14} />
        </button>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
