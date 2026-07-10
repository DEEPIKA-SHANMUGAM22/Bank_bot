import { useState, useEffect, useCallback } from 'react';
import { useChat } from '../hooks/useChat';
import { useDocuments } from '../hooks/useDocuments';
import { useTheme } from '../hooks/useTheme';
import { useChatHistory } from '../hooks/useChatHistory';
import { getHealth } from '../services/api';

import Header from '../components/Header/Header';
import Sidebar from '../components/Sidebar/Sidebar';
import ChatWindow from '../components/Chat/ChatWindow';
import UploadPanel from '../components/Upload/UploadPanel';

export default function ChatPage() {
  const { isDark, toggleTheme } = useTheme();
  const { sessions, saveSession, renameSession, deleteSession, clearAll } = useChatHistory();

  const { messages, isLoading, sendChat, suggestFaq, startNewSession, loadSession, sessionId } =
    useChat({
      onMessagesChange: (sid, msgs) => {
        if (msgs.length > 0) saveSession(sid, msgs);
      },
    });

  const {
    documents,
    isLoading: isLoadingDocs,
    isUploading,
    uploadProgress,
    loadDocuments,
    removeDocument,
    upload,
  } = useDocuments();

  const [showUpload, setShowUpload] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState(sessionId);

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Health check every 30s
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
    await removeDocument(docId);
  };

  /** Switch to a past session */
  const handleSelectSession = useCallback(
    (sid, savedMessages) => {
      setActiveSessionId(sid);
      loadSession(sid, savedMessages);
    },
    [loadSession]
  );

  /** Start a fresh conversation */
  const handleNewChat = useCallback(() => {
    startNewSession();
    setActiveSessionId(sessionId);
  }, [startNewSession, sessionId]);

  const handleDeleteSession = useCallback(
    (sid) => {
      deleteSession(sid);
      // If user deletes the active session, start fresh
      if (sid === activeSessionId) {
        handleNewChat();
      }
    },
    [deleteSession, activeSessionId, handleNewChat]
  );

  const handleClearHistory = useCallback(() => {
    clearAll();
    handleNewChat();
  }, [clearAll, handleNewChat]);

  return (
    <div className="app-layout">
      <Sidebar
        documents={documents}
        isLoadingDocs={isLoadingDocs}
        onRefreshDocs={loadDocuments}
        onDeleteDoc={handleDeleteDoc}
        onOpenUpload={() => setShowUpload(true)}
        chatSessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onRenameSession={renameSession}
        onClearHistory={handleClearHistory}
      />

      <div className="main-content">
        <Header isDark={isDark} onToggleTheme={toggleTheme} isConnected={isConnected} />
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          onSend={sendChat}
          onSuggestFaq={suggestFaq}
        />
      </div>

      {showUpload && (
        <UploadPanel
          onClose={() => setShowUpload(false)}
          onUpload={upload}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
        />
      )}
    </div>
  );
}
