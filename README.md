# 🏦 BankAssist AI – RAG Powered Banking Assistant

An intelligent banking assistant built using **React**, **FastAPI**, and **Google Gemini**, powered by **Retrieval-Augmented Generation (RAG)**. The system answers banking-related questions using uploaded banking documents instead of relying solely on a Large Language Model.

---

## 📖 Overview

BankAssist AI is designed to simulate a production-style enterprise banking knowledge assistant.

Instead of retraining an AI model whenever banking policies change, the system retrieves relevant information from a dynamic knowledge base and generates accurate, context-aware responses.

The application follows a role-based architecture:

- **Admin Portal** – Manages the knowledge base
- **Customer Portal** – Interacts with the AI assistant

---

# ✨ Features

## 👤 Customer Portal

- Ask banking-related questions
- AI-generated responses using RAG
- Semantic document retrieval
- Chat history
- Suggest unanswered questions to administrators
- Clean chat interface

---

## 👨‍💼 Admin Portal

- Upload banking documents
- Manage Knowledge Base
- Review pending customer suggestions
- Approve & ingest verified answers
- Continuously improve the knowledge base

---

# 🧠 RAG Workflow

```text
Admin Uploads Documents
            │
            ▼
     Document Processing
            │
            ▼
      Text Extraction
            │
            ▼
         Chunking
            │
            ▼
   Generate Embeddings
            │
            ▼
     Store in Vector DB



Customer asks question
            │
            ▼
 Generate Query Embedding
            │
            ▼
 Semantic Similarity Search
            │
            ▼
 Retrieve Relevant Chunks
            │
            ▼
 Google Gemini LLM
            │
            ▼
 Context-Aware Response
```

---

# 🔄 Human-in-the-Loop Workflow

If the assistant cannot answer a question:

```text
Customer Question
        │
        ▼
Knowledge Base Search

        │
        ▼
Answer Found?

Yes ─────────────► Return Answer

No
 │
 ▼
Suggest Question
 │
 ▼
Pending Suggestions
 │
 ▼
Admin Reviews
 │
 ▼
Approve & Ingest
 │
 ▼
Knowledge Base Updated
```

This allows the system to continuously improve while ensuring only verified information enters the knowledge base.

---

# 🛠 Tech Stack

## Frontend

- React.js
- JavaScript
- HTML5
- CSS3

## Backend

- FastAPI
- Python

## AI & RAG

- Google Gemini
- Document Chunking
- Embeddings
- Semantic Search
- Retrieval-Augmented Generation (RAG)

## Storage

- Vector Database
- Knowledge Base

---

# 📂 Project Structure

```text
BankAssist-AI/

├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   └── user/
│   │   ├── components/
│   │   └── services/
│
├── backend/
│   ├── routers/
│   ├── services/
│   ├── llm/
│   ├── embeddings/
│   ├── vector_store/
│   └── main.py
│
├── uploads/
├── README.md
└── requirements.txt
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/BankAssist-AI.git
```

```bash
cd BankAssist-AI
```

---

## Backend Setup

```bash
cd backend
```

Create virtual environment

```bash
python -m venv venv
```

Activate

Windows

```bash
venv\Scripts\activate
```

Linux / macOS

```bash
source venv/bin/activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Run backend

```bash
uvicorn main:app --reload
```

---

## Frontend Setup

```bash
cd frontend
```

```bash
npm install
```

```bash
npm run dev
```

---

# 📸 

https://drive.google.com/file/d/14RiWuOdY-zAa7U694etrNear3rjGyt3K/view?usp=drive_link

# 💡 Future Enhancements

- JWT Authentication
- Role-Based Access Control (RBAC)
- Audit Logs
- Multiple Knowledge Bases
- Cloud Deployment
- Conversation Memory
- Analytics Dashboard
- OCR Support for Scanned PDFs
- Multi-language Support

---

# 🎯 Learning Outcomes

Through this project, I gained hands-on experience in:

- Retrieval-Augmented Generation (RAG)
- Semantic Search
- Embedding-based Retrieval
- Google Gemini API Integration
- Prompt Engineering
- FastAPI Development
- React Frontend Development
- Knowledge Base Management
- Human-in-the-loop AI Systems

---

# 🤝 Contributing

Contributions, suggestions, and improvements are always welcome.

Feel free to fork the repository and submit a pull request.

---

# 📄 License

This project is developed for learning and educational purposes.

---

# 👩‍💻 Author

**Deepika Shanmugasundaram**

Computer Science Engineering (AI & ML)

Passionate about AI, Machine Learning, Computer Vision, Full Stack Development, and Generative AI.

📧 Email: contact.sdeepika@gmail.com

⭐ If you found this project helpful, consider giving it a Star!
