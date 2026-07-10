import { useState, useEffect } from 'react';
import { HelpCircle, Trash2, Check, X, ChevronDown, ChevronUp, MessageSquare, Loader2, Sparkles } from 'lucide-react';
import { fetchPendingQuestions, approvePendingQuestion, rejectPendingQuestion } from '../../services/api';

export default function PendingQuestions() {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [answers, setAnswers] = useState({});
  const [actioningQuestion, setActioningQuestion] = useState(null);

  const loadPendingQuestions = async () => {
    setIsLoading(true);
    try {
      const resp = await fetchPendingQuestions();
      setQuestions(resp.data || []);
    } catch (err) {
      console.error('Failed to load pending questions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPendingQuestions();
  }, []);

  const handleApprove = async (question) => {
    const answer = answers[question];
    if (!answer || !answer.trim()) return;

    setActioningQuestion(question);
    try {
      await approvePendingQuestion(question, answer);
      // Remove from list
      setQuestions((prev) => prev.filter((q) => q.question !== question));
      setAnswers((prev) => {
        const next = { ...prev };
        delete next[question];
        return next;
      });
      setExpandedIndex(null);
    } catch (err) {
      console.error('Failed to approve question:', err);
    } finally {
      setActioningQuestion(null);
    }
  };

  const handleReject = async (question) => {
    if (!window.confirm('Are you sure you want to reject and delete this suggested question?')) return;
    setActioningQuestion(question);
    try {
      await rejectPendingQuestion(question);
      setQuestions((prev) => prev.filter((q) => q.question !== question));
      setExpandedIndex(null);
    } catch (err) {
      console.error('Failed to reject question:', err);
    } finally {
      setActioningQuestion(null);
    }
  };

  const handleAnswerChange = (question, value) => {
    setAnswers((prev) => ({ ...prev, [question]: value }));
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return '';
    return new Date(isoStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>
          Suggested & Unanswered Questions
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          Review questions that the chatbot couldn't answer. Write an answer and approve them to automatically ingest them into the knowledge base.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Loader2 size={24} style={{ color: 'var(--accent)', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : questions.length === 0 ? (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <HelpCircle size={44} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>No pending suggestions</h3>
            <p style={{ fontSize: '0.8rem' }}>When users click "Suggest this to our team" on unanswered questions, they will appear here.</p>
          </div>
        ) : (
          questions.map((item, idx) => {
            const isExpanded = expandedIndex === idx;
            const isActioning = actioningQuestion === item.question;
            const currentAnswer = answers[item.question] || '';

            return (
              <div
                key={idx}
                style={{
                  background: 'var(--card)',
                  border: isExpanded ? '1px solid var(--accent)' : '1px solid var(--border)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                  opacity: isActioning ? 0.6 : 1,
                  pointerEvents: isActioning ? 'none' : 'auto',
                }}
              >
                {/* Header row */}
                <div
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <HelpCircle size={16} color="var(--accent)" />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textString: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.question}
                      </p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Suggested on {formatDate(item.timestamp)}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '12px' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleReject(item.question); }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        padding: '4px',
                        borderRadius: '6px',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                      title="Dismiss suggestion"
                    >
                      <Trash2 size={15} />
                    </button>
                    {isExpanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                  </div>
                </div>

                {/* Expandable answer panel */}
                {isExpanded && (
                  <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ marginTop: '16px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                        Provide Answer
                      </label>
                      <textarea
                        value={currentAnswer}
                        onChange={(e) => handleAnswerChange(item.question, e.target.value)}
                        placeholder="Write the official banking answer here..."
                        style={{
                          width: '100%',
                          minHeight: '100px',
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          borderRadius: '10px',
                          color: 'var(--text)',
                          fontSize: '0.85rem',
                          padding: '12px',
                          outline: 'none',
                          resize: 'vertical',
                          fontFamily: 'Inter, system-ui, sans-serif',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                      <button
                        onClick={() => setExpandedIndex(null)}
                        style={{
                          padding: '8px 16px',
                          background: 'transparent',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          color: 'var(--text)',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleApprove(item.question)}
                        disabled={!currentAnswer.trim()}
                        style={{
                          padding: '8px 18px',
                          background: !currentAnswer.trim() ? 'var(--border)' : 'linear-gradient(135deg, #10b981, #059669)',
                          border: 'none',
                          borderRadius: '8px',
                          color: !currentAnswer.trim() ? 'var(--text-muted)' : '#fff',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: !currentAnswer.trim() ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s ease',
                          boxShadow: !currentAnswer.trim() ? 'none' : '0 2px 8px rgba(16,185,129,0.3)',
                        }}
                      >
                        <Check size={14} />
                        Approve & Ingest
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
