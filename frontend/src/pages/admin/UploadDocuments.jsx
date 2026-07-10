import { useState, useCallback } from 'react';
import { Upload, CheckCircle2 } from 'lucide-react';
import DropZone from '../../components/Upload/DropZone';
import FileCard from '../../components/Upload/FileCard';
import { adminUploadFiles } from '../../services/api';

export default function UploadDocuments({ onUploadSuccess }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileStatuses, setFileStatuses] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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

    setIsUploading(true);
    setUploadProgress(0);

    const uploading = {};
    selectedFiles.forEach((f) => { uploading[f.name] = 'uploading'; });
    setFileStatuses(uploading);

    try {
      const response = await adminUploadFiles(selectedFiles, (progress) => {
        setUploadProgress(progress);
      });
      const result = response.data;
      setUploadResult(result);

      const newStatuses = {};
      result.uploaded?.forEach((doc) => { newStatuses[doc.filename] = 'success'; });
      result.failed?.forEach((f) => { newStatuses[f.filename] = 'error'; });
      result.duplicates?.forEach((name) => { newStatuses[name] = 'duplicate'; });
      setFileStatuses(newStatuses);

      // Trigger list refresh in parent if available
      onUploadSuccess?.();
    } catch (err) {
      console.error('Upload failed:', err);
      const failedStatuses = {};
      selectedFiles.forEach((f) => { failedStatuses[f.name] = 'error'; });
      setFileStatuses(failedStatuses);
    } finally {
      setIsUploading(false);
    }
  }, [selectedFiles, isUploading, onUploadSuccess]);

  const allDone = uploadResult && !isUploading;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>
          Upload Policy and FAQ Documents
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          Add documents (PDF, DOCX, TXT, CSV, XLSX) up to 50MB to expand the chatbot knowledge base.
        </p>
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
        <DropZone onFilesSelected={handleFilesSelected} />

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
              {uploadResult.uploaded.length} file(s) ingested successfully
              {uploadResult.duplicates?.length > 0
                ? ` · ${uploadResult.duplicates.length} duplicate(s) skipped`
                : ''}
            </span>
          </div>
        )}

        {selectedFiles.length > 0 && (
          <div style={{ marginTop: '20px' }}>
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

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          {selectedFiles.length > 0 && !allDone && (
            <button
              onClick={handleUpload}
              disabled={isUploading}
              style={{
                padding: '10px 24px',
                background: isUploading
                  ? 'var(--border)'
                  : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                border: 'none',
                borderRadius: '10px',
                color: isUploading ? 'var(--text-muted)' : '#fff',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: isUploading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
              }}
            >
              {isUploading ? 'Ingesting...' : 'Ingest to Vector DB'}
            </button>
          )}

          {allDone && (
            <button
              onClick={() => {
                setSelectedFiles([]);
                setUploadResult(null);
                setFileStatuses({});
              }}
              style={{
                padding: '10px 24px',
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                color: 'var(--text)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Clear / Upload More
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
