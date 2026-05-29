# ResumeIQ — AI-Powered Resume Analyzer & Job Matcher

A full-stack application that analyzes your resume against a job description using NLP techniques, providing match scores, skill gap analysis, and ATS compatibility scoring.

---

## Architecture Overview

```
resume-analyzer/
├── frontend/          # React.js + Tailwind CSS (Vite)
├── backend/           # Node.js + Express.js + MongoDB
└── ml-service/        # Python + Flask (NLP engine)
```

**Data flow:**
```
Browser → Express Backend → Flask ML Service → MongoDB → Browser
```

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, React Router, Tailwind CSS, Vite |
| Backend    | Node.js, Express.js, Mongoose, Multer |
| Database   | MongoDB                             |
| ML Service | Python, Flask, PyMuPDF, pdfplumber  |
| NLP        | Custom TF-IDF cosine similarity + skill taxonomy |

---

## API Endpoints

### Backend (Express) — Port 3001

| Method | Endpoint                    | Description                          |
|--------|-----------------------------|--------------------------------------|
| GET    | `/api/health`               | Health check                         |
| POST   | `/api/resume/upload`        | Upload PDF → extract text via ML     |
| POST   | `/api/analysis/analyze`     | Run full analysis, save to DB        |
| GET    | `/api/analysis/history`     | Paginated history list               |
| GET    | `/api/analysis/:id`         | Get single analysis by ID            |
| DELETE | `/api/analysis/:id`         | Delete an analysis                   |

### ML Service (Flask) — Port 5001

| Method | Endpoint          | Description                        |
|--------|-------------------|------------------------------------|
| GET    | `/health`         | Health check                       |
| POST   | `/extract-text`   | Extract text from uploaded PDF     |
| POST   | `/analyze`        | NLP analysis (skills + similarity) |

---

## Database Schema

### `analyses` collection (MongoDB)

```js
{
  _id: ObjectId,
  resumeFileName: String,       // e.g. "john_doe_resume.pdf"
  jobTitle: String,             // e.g. "Senior Software Engineer"
  resumeText: String,           // full extracted resume text
  jobDescription: String,       // full job description text

  // Scores
  matchPercentage: Number,      // 0–100, composite score
  atsScore: Number,             // 0–100, ATS compatibility
  atsGrade: String,             // "Excellent" | "Good" | "Fair" | "Needs Work"

  // Skills
  matchingSkills: [String],     // skills in both resume and JD
  missingSkills: [String],      // required by JD, absent in resume
  extraSkills: [String],        // in resume, not mentioned in JD
  resumeSkills: [String],       // all detected resume skills
  jdSkills: [String],           // all detected JD skills

  // Detailed metrics
  metrics: {
    textSimilarity: Number,     // TF-IDF cosine similarity %
    skillMatchRatio: Number,    // skill overlap %
    keywordCoverage: Number,    // JD keyword coverage %
  },

  recommendations: [String],   // AI-generated improvement tips

  stats: {
    resumeWordCount: Number,
    jdWordCount: Number,
    resumeSkillCount: Number,
    jdSkillCount: Number,
  },

  createdAt: Date,              // auto
  updatedAt: Date,              // auto
}
```

---

## Setup Instructions

### Prerequisites

- **Node.js** v18+ — https://nodejs.org
- **Python** 3.9+ — https://python.org
- **MongoDB** (local) — https://www.mongodb.com/try/download/community
  - Or use MongoDB Atlas (free cloud tier) — update `MONGO_URI` in `.env`
- **pip** (comes with Python)

---

### 1. Clone / download the project

```bash
# If using git:
git clone <your-repo-url>
cd resume-analyzer
```

---

### 2. Start MongoDB

**macOS (Homebrew):**
```bash
brew services start mongodb-community
```

**Ubuntu/Debian:**
```bash
sudo systemctl start mongod
```

**Windows:**
```bash
net start MongoDB
```

**Or use MongoDB Atlas** — create a free cluster and copy the connection URI.

---

### 3. Set up the ML Service (Python)

```bash
cd ml-service

# Create a virtual environment (recommended)
python -m venv venv

# Activate it
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the Flask server
python app.py
```

The ML service will start at **http://localhost:5001**

**Optional — richer NLP with spaCy:**
```bash
pip install spacy
python -m spacy download en_core_web_sm
# Then uncomment the spacy line in requirements.txt
```

---

### 4. Set up the Backend (Node.js)

```bash
cd backend

# Install dependencies
npm install


# Start the server
npm run dev      # development (nodemon, auto-reload)
# or
npm start        # production
```

The backend will start at **http://localhost:3001**

---

### 5. Set up the Frontend (React)

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The frontend will start at **http://localhost:5173**

---

### 6. Open the app

Navigate to **http://localhost:5173** in your browser.

**Quick test:**
1. Go to the Upload tab
2. Upload a PDF resume
3. Go to the Job tab — paste a job description (or click "Load sample")
4. Click Analyze Match
5. View your results dashboard

---

## Project Structure (detailed)

```
resume-analyzer/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.jsx          # Nav + shell
│   │   ├── pages/
│   │   │   ├── UploadPage.jsx      # Step 1: PDF upload
│   │   │   ├── JobDescriptionPage.jsx  # Step 2: JD input
│   │   │   ├── ResultsPage.jsx     # Dashboard with scores
│   │   │   └── HistoryPage.jsx     # Past analyses
│   │   ├── utils/
│   │   │   └── api.js              # Axios API calls
│   │   ├── App.jsx                 # Router
│   │   ├── main.jsx                # Entry point
│   │   └── index.css               # Tailwind + design tokens
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/
│   ├── models/
│   │   └── Analysis.js             # Mongoose schema
│   ├── routes/
│   │   ├── resume.js               # PDF upload → ML service
│   │   └── analysis.js             # CRUD + analyze endpoint
│   ├── server.js                   # Express app
│   ├── .env.example
│   └── package.json
│
└── ml-service/
    ├── utils/
    │   ├── __init__.py
    │   ├── pdf_extractor.py        # PyMuPDF + pdfplumber
    │   ├── skill_extractor.py      # Taxonomy-based NLP
    │   └── matcher.py              # TF-IDF cosine similarity
    ├── app.py                      # Flask API
    └── requirements.txt
```

---

## How the AI Scoring Works

### Match Percentage (composite)
```
Match % = (0.40 × Text Similarity) + (0.40 × Skill Match) + (0.20 × Keyword Coverage)
```

### ATS Score
```
ATS Score = (0.50 × Skill Match) + (0.30 × Keyword Coverage) + (0.20 × Text Similarity)
```

### Text Similarity
TF-IDF vectors built from resume and JD tokens → cosine similarity computed without external ML libraries.

### Skill Extraction
A curated taxonomy of 150+ skills across 8 categories (programming languages, frontend, backend, databases, cloud/DevOps, data/ML, mobile, tools) matched using regex word-boundary search. Multi-word skills (e.g. "machine learning") are matched before shorter ones.

---

