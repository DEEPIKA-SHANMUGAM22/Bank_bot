import { FileText } from 'lucide-react';

function getScoreColor(score) {
  if (score >= 0.85) return '#22c55e';
  if (score >= 0.75) return '#eab308';
  return '#f97316';
}

function getScoreLabel(score) {
  if (score >= 0.85) return 'High';
  if (score >= 0.75) return 'Medium';
  return 'Low';
}

/**
 * Derive a meaningful label from the chunk text.
 * Uses the first non-empty line — which is usually a Q: or section heading.
 */
function getChunkLabel(source) {
  const text = source.text || source.content || '';
  if (!text) return null;

  const firstLine = text.split('\n').find((l) => l.trim().length > 3);
  if (!firstLine) return null;

  // Strip Q: / A: / === / --- prefixes and trim
  const cleaned = firstLine
    .replace(/^(Q:|A:|#+|={3,}|-{3,})\s*/i, '')
    .trim();

  return cleaned.length > 55 ? cleaned.slice(0, 55) + '…' : cleaned;
}

/**
 * Return a human-readable location label.
 * For PDFs/DOCX: "Page N"
 * For XLSX: "Sheet: SheetName"
 * For TXT/CSV: "Chunk N"
 */
function getLocationLabel(source) {
  if (source.sheet && source.sheet !== '') return `Sheet: ${source.sheet}`;
  if (source.page && source.page !== '' && source.page !== 1 && source.page !== '1')
    return `Page ${source.page}`;
  if (source.chunk_index !== undefined && source.chunk_index !== '')
    return `Chunk ${Number(source.chunk_index) + 1}`;
  return null;
}

export default function CitationCard({ source, index }) {
  const scoreColor = getScoreColor(source.score);
  const scoreLabel = getScoreLabel(source.score);
  const percent = Math.round(source.score * 100);

  const chunkLabel = getChunkLabel(source);
  const locationLabel = getLocationLabel(source);

  // Filename without extension for display
  const displayName = (source.document || '')
    .replace(/\.[^/.]+$/, '')          // strip extension
    .replace(/[_-]/g, ' ')            // underscores/dashes → spaces
    .replace(/\b\w/g, (c) => c.toUpperCase()); // title case

  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '10px 12px',
        minWidth: '190px',
        maxWidth: '230px',
        flexShrink: 0,
        transition: 'all 0.2s ease',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = scoreColor;
        e.currentTarget.style.boxShadow = `0 0 0 2px ${scoreColor}20`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* ── Header ──────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
        <div
          style={{
            width: '22px',
            height: '22px',
            borderRadius: '6px',
            background: `${scoreColor}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <FileText size={12} color={scoreColor} />
        </div>
        {/* Source number badge */}
        <span
          style={{
            fontSize: '0.65rem',
            color: scoreColor,
            fontWeight: 700,
            background: `${scoreColor}18`,
            borderRadius: '4px',
            padding: '1px 6px',
            letterSpacing: '0.02em',
          }}
        >
          #{index + 1}
        </span>
        {/* Location (Chunk N / Page N / Sheet) */}
        {locationLabel && (
          <span
            style={{
              fontSize: '0.65rem',
              color: 'var(--text-muted)',
              marginLeft: 'auto',
              whiteSpace: 'nowrap',
            }}
          >
            {locationLabel}
          </span>
        )}
      </div>

      {/* ── Document name ───────────────────────────── */}
      <p
        style={{
          fontSize: '0.72rem',
          fontWeight: 700,
          color: 'var(--text)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          marginBottom: '3px',
        }}
        title={source.document}
      >
        {displayName}
      </p>

      {/* ── Chunk label (first line of content) ─────── */}
      {chunkLabel && (
        <p
          style={{
            fontSize: '0.68rem',
            color: 'var(--text-muted)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            marginBottom: '6px',
            fontStyle: 'italic',
          }}
          title={chunkLabel}
        >
          "{chunkLabel}"
        </p>
      )}

      {/* ── Relevance bar ───────────────────────────── */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '3px',
          }}
        >
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Relevance</span>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: scoreColor }}>
            {percent}% · {scoreLabel}
          </span>
        </div>
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{ width: `${percent}%`, background: scoreColor }}
          />
        </div>
      </div>
    </div>
  );
}
