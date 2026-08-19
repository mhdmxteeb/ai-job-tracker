# AI Job Tracker

AI-powered job application and resume analysis platform. Upload a resume and job description to receive ATS scoring, keyword matching, skill-gap analysis, resume improvement suggestions, and interview questions.

## Features

- User registration and login with JWT authentication
- Resume upload and PDF text extraction
- AI-powered resume and job-description analysis with Google Gemini
- ATS score and keyword match percentage
- Technical and soft-skill gap analysis
- Resume, project, and bullet-point improvement suggestions
- Interview question generation
- Saved application history in MongoDB

## Tech Stack

- Frontend: React, Vite, React Router, Tailwind CSS, Recharts
- Backend: Node.js, Express, MongoDB, Mongoose
- AI: Google Gemini via `@google/genai`

## Requirements

- Node.js 18 or newer
- MongoDB database
- Google Gemini API key

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/mhdmxteeb/job-tracker.git
cd job-tracker

cd backend
npm install

cd ../frontend
npm install
```

## Environment Variables

Create `backend/.env`:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
GEMINI_API_KEY=your_google_gemini_api_key
PORT=5000
```

Never commit `.env` files or API keys to GitHub.

## Running Locally

Open two terminals from the project root.

Terminal 1, start the backend:

```bash
cd backend
npm start
```

If `npm start` is not configured in your local copy, run:

```bash
node server.js
```

Terminal 2, start the frontend:

```bash
cd frontend
npm run dev
```

Open the URL shown by Vite, usually `http://localhost:5173`.

## Production Build

Build the frontend with:

```bash
cd frontend
npm run build
```

## API Routes

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Register a user |
| `POST` | `/api/auth/login` | Log in and receive a JWT |
| `GET` | `/api/auth` | Get the authenticated user |
| `POST` | `/api/resume/analyze` | Analyze a resume and job description |
| `GET` | `/api/resume/applications` | List saved applications |

## License

This project is currently unlicensed.