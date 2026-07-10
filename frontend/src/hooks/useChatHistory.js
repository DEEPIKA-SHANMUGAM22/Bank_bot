import { useState, useCallback, useEffect } from 'react';

const HISTORY_KEY = 'bankassist-chat-history';
const MAX_SESSIONS = 30;

export function useChatHistory() {
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist to localStorage whenever sessions change
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(sessions));
    } catch {
      // Ignore quota errors
    }
  }, [sessions]);

  /** Save or update a session in history */
  const saveSession = useCallback((sessionId, messages) => {
    if (!messages || messages.length === 0) return;
    const userMessages = messages.filter((m) => m.role === 'user');
    if (userMessages.length === 0) return;

    const title =
      userMessages[0].content.length > 55
        ? userMessages[0].content.slice(0, 55) + '…'
        : userMessages[0].content;

    setSessions((prev) => {
      const idx = prev.findIndex((s) => s.sessionId === sessionId);
      const entry = {
        sessionId,
        title,
        messageCount: messages.length,
        lastMessage: messages[messages.length - 1]?.content?.slice(0, 80) || '',
        timestamp: new Date().toISOString(),
        messages,
      };
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = entry;
        return copy;
      }
      return [entry, ...prev].slice(0, MAX_SESSIONS);
    });
  }, []);

  const renameSession = useCallback((sessionId, newTitle) => {
    if (!newTitle.trim()) return;
    setSessions((prev) =>
      prev.map((s) =>
        s.sessionId === sessionId ? { ...s, title: newTitle.trim() } : s
      )
    );
  }, []);

  const deleteSession = useCallback((sessionId) => {
    setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
  }, []);

  const clearAll = useCallback(() => setSessions([]), []);

  const getSession = useCallback(
    (sessionId) => sessions.find((s) => s.sessionId === sessionId) || null,
    [sessions]
  );

  return { sessions, saveSession, renameSession, deleteSession, clearAll, getSession };
}
