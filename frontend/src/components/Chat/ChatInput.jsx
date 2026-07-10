import { useState, useRef, useCallback } from 'react';
import { Send } from 'lucide-react';

export default function ChatInput({ onSend, isLoading, disabled }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    // Save last question for FAQ suggestion
    sessionStorage.setItem('bankassist-last-question', trimmed);
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [value, isLoading, onSend]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e) => {
    setValue(e.target.value);
    // Auto-resize
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = `${Math.min(ta.scrollHeight, 140)}px`;
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '10px',
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding: '8px 12px',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      }}
      onFocusCapture={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent)';
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)';
      }}
      onBlurCapture={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Ask about banking products, loans, accounts..."
        disabled={disabled || isLoading}
        rows={1}
        style={{
          flex: 1,
          resize: 'none',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: 'var(--text)',
          fontSize: '0.9rem',
          lineHeight: '1.5',
          fontFamily: 'Inter, system-ui, sans-serif',
          minHeight: '24px',
          maxHeight: '140px',
          overflowY: 'auto',
        }}
      />

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={!value.trim() || isLoading}
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background:
            !value.trim() || isLoading
              ? 'var(--border)'
              : 'linear-gradient(135deg, #3b82f6, #2563eb)',
          border: 'none',
          cursor: !value.trim() || isLoading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'all 0.2s ease',
          boxShadow:
            !value.trim() || isLoading ? 'none' : '0 2px 8px rgba(59,130,246,0.4)',
        }}
        onMouseEnter={(e) => {
          if (!e.currentTarget.disabled) {
            e.currentTarget.style.transform = 'scale(1.05)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {isLoading ? (
          <div
            style={{
              width: '16px',
              height: '16px',
              border: '2px solid rgba(255,255,255,0.4)',
              borderTopColor: '#fff',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
        ) : (
          <Send size={16} color={!value.trim() ? 'var(--text-muted)' : '#fff'} />
        )}
      </button>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
