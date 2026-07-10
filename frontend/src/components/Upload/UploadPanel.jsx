import { useState, useCallback } from 'react';
import { X, Upload, CheckCircle2 } from 'lucide-react';
import DropZone from './DropZone';
import FileCard from './FileCard';

export default function UploadPanel({ onClose, onUpload, isUploading, uploadProgress }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileStatuses, setFileStatuses] = useState({});
  const [uploadResult, setUploadResult] = useState(null);

  const handleFilesSelected = useCallback((newFiles) => {
    setSelectedFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name));
      const unique = newFiles.filter((f) => !existing.has(f.name));
      return [...prev, ...unique];
    });
    setUploadResult(null);
  }, []);

  const handleRemove = useCallback((file) => {
    setSelectedFiles((prev) => prev.filter((f) => f.name !== file.name));
    setFileStatuses((prev) => {
      const next = { ...prev };
      delete next[file.name];
      return next;
    });
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFiles.length || isUploading) return;

    // Mark all as uploading
    const uploading = {};
    selectedFiles.forEach((f) => { uploading[f.name] = 'uploading'; });
    setFileStatuses(uploading);

    const result = await onUpload(selectedFiles);
    setUploadResult(result);

    // Update statuses based on result
    const newStatuses = {};
    result.uploaded?.forEach((doc) => { newStatuses[doc.filename] = 'success'; });
    result.failed?.forEach((f) => { newStatuses[f.filename] = 'error'; });
    result.duplicates?.forEach((name) => { newStatuses[name] = 'duplicate'; });
    setFileStatuses(newStatuses);
  }, [selectedFiles, isUploading, onUpload]);

  const allDone = uploadResult && !isUploading;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="fade-in"
        style={{
          background: 'var(--sidebar)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '520px',
          maxHeight: '85vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 20px 14px',
            borderBottom: '1px solid var(--border)',
            flexShrink: 0,
          }}
        >
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>
              Upload Documents
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              PDF, DOCX, TXT, CSV, XLSX · Max {50}MB per file
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#ef4444';
              e.currentTarget.style.color = '#ef4444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          <DropZone onFilesSelected={handleFilesSelected} />

          {/* Success summary */}
          {allDone && uploadResult.uploaded?.length > 0 && (
            <div
              style={{
                marginTop: '14px',
                padding: '10px 14px',
                background: 'rgba(34,197,94,0.1)',
                border: '1px solid rgba(34,197,94,0.3)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <CheckCircle2 size={16} color="#22c55e" />
              <span style={{ fontSize: '0.8rem', color: '#22c55e', fontWeight: 600 }}>
                {uploadResult.uploaded.length} file(s) uploaded successfully
                {uploadResult.duplicates?.length > 0
                  ? ` · ${uploadResult.duplicates.length} duplicate(s) skipped`
                  : ''}
              </span>
            </div>
          )}

          {/* File list */}
          {selectedFiles.length > 0 && (
            <div style={{ marginTop: '14px' }}>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Selected Files ({selectedFiles.length})
              </p>
              {selectedFiles.map((file) => (
                <FileCard
                  key={file.name}
                  file={file}
                  status={fileStatuses[file.name] || 'pending'}
                  progress={uploadProgress}
                  errorMessage={
                    uploadResult?.failed?.find((f) => f.filename === file.name)?.reason
                  }
                  onRemove={handleRemove}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            gap: '10px',
            flexShrink: 0,
          }}
        >
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '10px',
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              color: 'var(--text)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'Inter, system-ui, sans-serif',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            {allDone ? 'Close' : 'Cancel'}
          </button>

          {!allDone && (
            <button
              onClick={handleUpload}
              disabled={!selectedFiles.length || isUploading}
              style={{
                flex: 2,
                padding: '10px',
                background:
                  !selectedFiles.length || isUploading
                    ? 'var(--border)'
                    : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                border: 'none',
                borderRadius: '10px',
                color: !selectedFiles.length || isUploading ? 'var(--text-muted)' : '#fff',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: !selectedFiles.length || isUploading ? 'not-allowed' : 'pointer',
                fontFamily: 'Inter, system-ui, sans-serif',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                boxShadow:
                  !selectedFiles.length || isUploading
                    ? 'none'
                    : '0 2px 8px rgba(59,130,246,0.4)',
              }}
            >
              {isUploading ? (
                <>
                  <div
                    style={{
                      width: '14px',
                      height: '14px',
                      border: '2px solid rgba(255,255,255,0.4)',
                      borderTopColor: '#fff',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                  Processing...
                </>
              ) : (
                <>
                  <Upload size={15} />
                  Upload {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}
                </>
              )}
            </button>
          )}
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
