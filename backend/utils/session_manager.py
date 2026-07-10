import time
import threading
from typing import Dict, List, Any, Optional
from utils.logger import get_logger
from config import SESSION_TIMEOUT_MINUTES

logger = get_logger(__name__)


class SessionManager:
    """Manages chat sessions with auto-expiry."""

    def __init__(self):
        self._sessions: Dict[str, Dict[str, Any]] = {}
        self._lock = threading.Lock()
        self._cleanup_interval = 60  # seconds
        self._start_cleanup_thread()

    def _start_cleanup_thread(self):
        """Start background thread to clean expired sessions."""
        thread = threading.Thread(target=self._cleanup_loop, daemon=True)
        thread.start()

    def _cleanup_loop(self):
        """Periodically remove expired sessions."""
        while True:
            time.sleep(self._cleanup_interval)
            self._remove_expired()

    def _remove_expired(self):
        """Remove sessions that have expired."""
        now = time.time()
        timeout = SESSION_TIMEOUT_MINUTES * 60
        with self._lock:
            expired = [
                sid
                for sid, data in self._sessions.items()
                if now - data["last_active"] > timeout
            ]
            for sid in expired:
                del self._sessions[sid]
                logger.info(f"Session {sid} expired and removed.")

    def get_history(self, session_id: str) -> List[Dict[str, str]]:
        """Return conversation history for session."""
        with self._lock:
            if session_id not in self._sessions:
                return []
            self._sessions[session_id]["last_active"] = time.time()
            return list(self._sessions[session_id]["history"])

    def add_message(self, session_id: str, role: str, content: str):
        """Add a message to a session's history (max 10 pairs)."""
        with self._lock:
            if session_id not in self._sessions:
                self._sessions[session_id] = {
                    "history": [],
                    "last_active": time.time(),
                }
            session = self._sessions[session_id]
            session["history"].append({"role": role, "content": content})
            # Keep only last 20 messages (10 pairs)
            if len(session["history"]) > 20:
                session["history"] = session["history"][-20:]
            session["last_active"] = time.time()

    def clear_session(self, session_id: str):
        """Clear session history."""
        with self._lock:
            if session_id in self._sessions:
                del self._sessions[session_id]

    def session_exists(self, session_id: str) -> bool:
        """Check if session exists."""
        with self._lock:
            return session_id in self._sessions


# Singleton
session_manager = SessionManager()
