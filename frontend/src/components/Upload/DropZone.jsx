import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, CloudUpload } from 'lucide-react';

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
  'text/csv': ['.csv'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
};

export default function DropZone({ onFilesSelected }) {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onFilesSelected(acceptedFiles);
      }
    },
    [onFilesSelected]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    multiple: true,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropAccepted: () => setIsDragging(false),
    onDropRejected: () => setIsDragging(false),
  });

  return (
    <div
      {...getRootProps()}
      className={`dropzone ${isDragging ? 'active' : ''}`}
      style={{
        padding: '32px 20px',
        textAlign: 'center',
        cursor: 'pointer',
        borderColor: isDragging ? 'var(--accent)' : undefined,
        background: isDragging ? 'rgba(59,130,246,0.08)' : undefined,
      }}
    >
      <input {...getInputProps()} />

      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: isDragging
            ? 'rgba(59,130,246,0.2)'
            : 'rgba(59,130,246,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 14px',
          transition: 'all 0.2s ease',
          border: '1px solid rgba(59,130,246,0.2)',
        }}
      >
        <CloudUpload
          size={26}
          color="var(--accent)"
          style={{ transition: 'transform 0.2s ease', transform: isDragging ? 'translateY(-4px)' : 'none' }}
        />
      </div>

      <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
        {isDragging ? 'Drop files here' : 'Drag & drop files here'}
      </p>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
        or click to browse
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
        {['.PDF', '.DOCX', '.TXT', '.CSV', '.XLSX'].map((ext) => (
          <span
            key={ext}
            style={{
              fontSize: '0.68rem',
              fontWeight: 600,
              background: 'rgba(59,130,246,0.1)',
              color: 'var(--accent)',
              borderRadius: '6px',
              padding: '3px 8px',
              border: '1px solid rgba(59,130,246,0.2)',
            }}
          >
            {ext}
          </span>
        ))}
      </div>
    </div>
  );
}
