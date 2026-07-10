# BankAssist AI — RAG Banking FAQ Chatbot

A production-quality RAG (Retrieval-Augmented Generation) chatbot built for banking FAQ systems.

## Stack
- **Backend**: FastAPI + Python + ChromaDB + sentence-transformers + Google Gemini 1.5 Flash
- **Frontend**: React + Vite + Tailwind CSS

---

## Setup & Run

### 1. Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy .env and add your Gemini API key
copy .env.example .env
# Edit .env and set GEMINI_API_KEY=your-key

# Run server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API docs available at: http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

App available at: http://localhost:5173

---

## Features
- 📄 Upload PDF, DOCX, TXT, CSV, XLSX files
- 🔍 Semantic search with ChromaDB + sentence-transformers
- 🤖 RAG answers powered by Google Gemini 1.5 Flash
- 💬 Session-based conversation memory (last 10 exchanges)
- 📎 Citation cards with relevance scores
- 🌙 Dark/Light mode toggle
- 🔄 Duplicate detection via file hashing
- 📊 Fallback handling with FAQ suggestion
