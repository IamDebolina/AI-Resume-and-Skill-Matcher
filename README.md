# AI Recruitment Platform

Full-stack AI-powered recruitment platform with resume matching, skill gap analysis, ATS optimization, and job intelligence.

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, Framer Motion, Recharts, Axios
- **Backend:** FastAPI, Sentence Transformers, spaCy, scikit-learn, pdfplumber, bcrypt, JWT
- **Database:** MongoDB Atlas (pymongo)

## Project Structure

```
/frontend          # React Vite app
  /components
  /pages
  /services
/backend           # FastAPI app
  /routes
  /models
  /services
  /ai_engine
```

## Setup

### 1. Backend

```bash
cd "AI Resume matcher"
pip install -r requirements.txt
```

Install spaCy language model (required for NLP):

```bash
python -m spacy download en_core_web_sm
```

Create `.env` in project root:

```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ai_recruitment
JWT_SECRET=your_secret_key
MODEL_NAME=sentence-transformers/all-MiniLM-L6-v2
```

Run the backend:

```bash
uvicorn backend.main:app --reload
```

Backend runs at `http://localhost:8000`.

### 2. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```
VITE_API_URL=http://localhost:8000
```

Run the frontend:

```bash
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Features

- **Auth:** Register, Login, JWT-protected APIs
- **Resume Upload:** Drag-and-drop PDF upload with progress
- **Job Matching:** AI resume–job fit scores (semantic + skill match)
- **Skill Gap:** Matched/missing skills, recommendations, KMeans clusters
- **ATS Check:** Keyword density, section detection, suggestions
- **Resume Rewrite:** Action-impact bullet enhancement
- **Jobs:** Sample jobs + optional URL scraping
- **Dashboards:** User dashboard + Admin analytics

## Deployment

- **Frontend:** Deploy to Vercel (`npm run build`, output in `dist/`)
- **Backend:** Deploy to Render (use `uvicorn backend.main:app`)
- **Database:** MongoDB Atlas
