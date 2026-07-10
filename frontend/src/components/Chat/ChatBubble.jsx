import ReactMarkdown from 'react-markdown';
import CitationCard from './CitationCard';
import { User } from 'lucide-react';

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function UserBubble({ message }) {
  return (
    <div
      className="slide-up"
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        gap: '8px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <div className="bubble-user">{message.content}</div>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          {formatTime(message.timestamp)}
        </span>
      </div>
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <User size={16} color="#fff" />
      </div>
    </div>
  );
}

function BotBubble({ message, onSuggestFaq }) {
  return (
    <div
      className="slide-up"
      style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}
    >
      {/* Avatar */}
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '15px',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(59,130,246,0.35)',
        }}
      >
        🏦
      </div>

      <div style={{ maxWidth: '75%' }}>
        <div className="bubble-bot prose-bot">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>



        {/* Suggest FAQ button for fallback */}
        {message.isFallback && onSuggestFaq && (
          <button
            onClick={() => onSuggestFaq(
              sessionStorage.getItem('bankassist-last-question') || message.content
            )}
            style={{
              marginTop: '10px',
              background: 'transparent',
              border: '1px solid var(--accent)',
              color: 'var(--accent)',
              borderRadius: '8px',
              padding: '5px 12px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--accent)';
            }}
          >
            💡 Suggest this to our team
          </button>
        )}

        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}

export default function ChatBubble({ message, onSuggestFaq }) {
  if (message.role === 'user') {
    return <UserBubble message={message} />;
  }
  return <BotBubble message={message} onSuggestFaq={onSuggestFaq} />;
}
