import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// ─── Chat ──────────────────────────────────────────────────────────
export const sendMessage = (sessionId, message) =>
  api.post('/chat', { session_id: sessionId, message });

// ─── Suggest (User Side) ───────────────────────────────────────────
export const suggestQuestion = (sessionId, question) =>
  api.post('/suggest', { session_id: sessionId, question });

// ─── Admin Documents ───────────────────────────────────────────────
export const adminFetchDocuments = () => api.get('/admin/documents');

export const adminDeleteDocument = (docId) => api.delete(`/admin/documents/${docId}`);

// ─── Admin Upload ──────────────────────────────────────────────────
export const adminUploadFiles = (files, onProgress) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  return api.post('/admin/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        const percent = Math.round((e.loaded * 100) / e.total);
        onProgress(percent);
      }
    },
  });
};

// ─── Admin Pending Questions ───────────────────────────────────────
export const fetchPendingQuestions = () => api.get('/admin/pending-questions');

export const approvePendingQuestion = (question, answer) =>
  api.post('/admin/pending-questions/approve', { question, answer });

export const rejectPendingQuestion = (question) =>
  api.delete(`/admin/pending-questions?question=${encodeURIComponent(question)}`);

// ─── Health ────────────────────────────────────────────────────────
export const getHealth = () => api.get('/health');

export default api;

