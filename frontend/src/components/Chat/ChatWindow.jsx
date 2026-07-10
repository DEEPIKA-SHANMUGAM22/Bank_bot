import { useEffect, useRef } from 'react';
import { MessageCircle, Sparkles } from 'lucide-react';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';

const STARTER_QUESTIONS = [
  '📋 What documents are required for a home loan?',
  '💰 What is the processing fee for a personal loan?',
  '🏦 How do I open a zero balance account?',
  '📊 What are the current fixed deposit interest rates?',
  '💳 How do I apply for a credit card?',
];

function EmptyState({ onSelectStarter }) {
  return (
    <div
      className="fade-in"
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          boxShadow: '0 8px 24px rgba(59,130,246,0.35)',
          fontSize: '32px',
        }}
      >
        🏦
      </div>

      <h2
        style={{
          fontSize: '1.4rem',
          fontWeight: 800,
          color: 'var(--text)',
          marginBottom: '8px',
          letterSpacing: '-0.4px',
        }}
      >
        Welcome to BankAssist AI
      </h2>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '32px', maxWidth: '360px' }}>
        Upload your banking documents and ask me anything. I'll provide accurate answers based only on your uploaded content.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '500px' }}>
        <p
          style={{
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            justifyContent: 'center',
            marginBottom: '4px',
          }}
        >
          <Sparkles size={12} />
          Try asking
        </p>
        {STARTER_QUESTIONS.map((q, i) => (
          <button
            key={i}
            onClick={() => onSelectStarter(q.replace(/^[^\s]+ /, ''))}
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '11px 16px',
              fontSize: '0.85rem',
              color: 'var(--text)',
              cursor: 'pointer',
              textAlign: 'left',
              fontFamily: 'Inter, system-ui, sans-serif',
              fontWeight: 500,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.background = 'rgba(59,130,246,0.06)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.background = 'var(--card)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ChatWindow({ messages, isLoading, onSend, onSuggestFaq }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Messages area */}
      <div className="chat-area">
        {messages.length === 0 ? (
          <EmptyState onSelectStarter={onSend} />
        ) : (
          <>
            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} onSuggestFaq={onSuggestFaq} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <ChatInput onSend={onSend} isLoading={isLoading} disabled={false} />
        <p
          style={{
            fontSize: '0.67rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
            marginTop: '6px',
          }}
        >
          Answers are based solely on uploaded documents · Press Enter to send
        </p>
      </div>
    </div>
  );
}
