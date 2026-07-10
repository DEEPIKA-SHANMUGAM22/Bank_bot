import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Database, HelpCircle, MessageSquare, ChevronRight } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { getHealth, adminFetchDocuments, adminDeleteDocument } from '../../services/api';

import Header from '../../components/Header/Header';
import UploadDocuments from './UploadDocuments';
import KnowledgeBase from './KnowledgeBase';
import PendingQuestions from './PendingQuestions';

export default function AdminDashboard() {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('kb'); // 'kb', 'upload', 'questions'
  const [documents, setDocuments] = useState([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Load documents
  const loadDocuments = useCallback(async () => {
    setIsLoadingDocs(true);
    try {
      const resp = await adminFetchDocuments();
      setDocuments(resp.data?.documents || []);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setIsLoadingDocs(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Health check
  useEffect(() => {
    const check = async () => {
      try {
        await getHealth();
        setIsConnected(true);
      } catch {
        setIsConnected(false);
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleDeleteDoc = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document from the knowledge base? This will remove all associated chunks and embeddings.')) return;
    try {
      await adminDeleteDocument(docId);
      setDocuments((prev) => prev.filter((d) => d.doc_id !== docId));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="app-layout">
      {/* Admin Sidebar Navigation */}
      <aside className="sidebar">
        <div style={{ padding: '18px 14px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(16,185,129,0.4)', fontSize: '20px' }}>
              ⚙️
            </div>
            <div>
              <p style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.3px' }}>
                Admin Portal
              </p>
              <p style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Management
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/chat')}
            style={{
              width: '100%',
              background: 'rgba(59,130,246,0.12)',
              border: '1px solid rgba(59,130,246,0.25)',
              color: 'var(--accent)',
              borderRadius: '10px',
              padding: '9px 12px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(59,130,246,0.12)';
              e.currentTarget.style.color = 'var(--accent)';
            }}
          >
            <MessageSquare size={14} />
            Switch to Chat
            <ChevronRight size={12} style={{ marginLeft: 'auto' }} />
          </button>
        </div>

        {/* Navigation list */}
        <div style={{ flex: 1, padding: '14px 8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button
            onClick={() => setActiveTab('kb')}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '9px',
              background: activeTab === 'kb' ? 'rgba(16,185,129,0.15)' : 'transparent',
              border: activeTab === 'kb' ? '1px solid rgba(16,185,129,0.3)' : '1px solid transparent',
              color: activeTab === 'kb' ? '#10b981' : 'var(--text)',
              fontSize: '0.82rem',
              fontWeight: 600,
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease',
            }}
          >
            <Database size={15} />
            Knowledge Base
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '9px',
              background: activeTab === 'upload' ? 'rgba(16,185,129,0.15)' : 'transparent',
              border: activeTab === 'upload' ? '1px solid rgba(16,185,129,0.3)' : '1px solid transparent',
              color: activeTab === 'upload' ? '#10b981' : 'var(--text)',
              fontSize: '0.82rem',
              fontWeight: 600,
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease',
            }}
          >
            <Upload size={15} />
            Upload Documents
          </button>

          <button
            onClick={() => setActiveTab('questions')}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '9px',
              background: activeTab === 'questions' ? 'rgba(16,185,129,0.15)' : 'transparent',
              border: activeTab === 'questions' ? '1px solid rgba(16,185,129,0.3)' : '1px solid transparent',
              color: activeTab === 'questions' ? '#10b981' : 'var(--text)',
              fontSize: '0.82rem',
              fontWeight: 600,
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease',
            }}
          >
            <HelpCircle size={15} />
            Pending Suggestions
          </button>
        </div>
      </aside>

      {/* Main Admin Dashboard Body */}
      <div className="main-content">
        <Header isDark={isDark} onToggleTheme={toggleTheme} isConnected={isConnected} />
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 30px' }}>
          {activeTab === 'kb' && (
            <KnowledgeBase
              documents={documents}
              isLoading={isLoadingDocs}
              onRefresh={loadDocuments}
              onDelete={handleDeleteDoc}
            />
          )}
          {activeTab === 'upload' && (
            <UploadDocuments onUploadSuccess={loadDocuments} />
          )}
          {activeTab === 'questions' && (
            <PendingQuestions />
          )}
        </div>
      </div>
    </div>
  );
}
