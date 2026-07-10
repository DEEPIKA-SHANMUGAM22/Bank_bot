import { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { sendMessage, suggestQuestion } from '../services/api';

const createSessionId = () => uuidv4();

const getOrCreateSessionId = () => {
  let id = sessionStorage.getItem('bankassist-session-id');
  if (!id) {
    id = createSessionId();
    sessionStorage.setItem('bankassist-session-id', id);
  }
  return id;
};

export function useChat({ onMessagesChange } = {}) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const sessionIdRef = useRef(getOrCreateSessionId());

  const sessionId = sessionIdRef.current;

  const addMessage = useCallback((role, content, sources = [], isFallback = false) => {
    const msg = {
      id: uuidv4(),
      role,
      content,
      sources,
      isFallback,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => {
      const next = [...prev, msg];
      onMessagesChange?.(sessionIdRef.current, next);
      return next;
    });
    return msg;
  }, [onMessagesChange]);

  const sendChat = useCallback(
    async (message) => {
      if (!message.trim() || isLoading) return;
      setError(null);
      addMessage('user', message);
      setIsLoading(true);
      try {
        const response = await sendMessage(sessionIdRef.current, message);
        const { answer, sources, is_fallback } = response.data;
        addMessage('assistant', answer, sources, is_fallback);
      } catch (err) {
        setError(err.message || 'Failed to get response.');
        addMessage('assistant', 'Sorry, I encountered an error. Please try again.', [], true);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, addMessage]
  );

  const suggestFaq = useCallback(
    async (question) => {
      try {
        await suggestQuestion(sessionIdRef.current, question);
        addMessage('assistant', '✅ Thank you! Your question has been submitted to our knowledge base team.', []);
      } catch (err) {
        console.error('Failed to suggest FAQ:', err);
      }
    },
    [addMessage]
  );

  /** Start a brand-new session — new UUID, clear messages */
  const startNewSession = useCallback(() => {
    const newId = createSessionId();
    sessionIdRef.current = newId;
    sessionStorage.setItem('bankassist-session-id', newId);
    setMessages([]);
    setError(null);
  }, []);

  /** Load a previous session's messages into the current view (read-only replay) */
  const loadSession = useCallback((sessionId, savedMessages) => {
    sessionIdRef.current = sessionId;
    sessionStorage.setItem('bankassist-session-id', sessionId);
    setMessages(savedMessages || []);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sessionId,
    sendChat,
    suggestFaq,
    startNewSession,
    loadSession,
  };
}
