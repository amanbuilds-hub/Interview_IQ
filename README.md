# InterviewIQ 🚀

A production-grade, AI-powered Interview Preparation Platform built to help job seekers master their interview skills through personalized, real-world mock simulations.

## ✨ Features
- **AI-Powered Questioning:** Generates personalized questions based on your unique resume and target role using Google Gemini.
- **Dynamic Interview Modes:** Switch between regular text answers and a built-in **Monaco Editor** for coding tasks.
- **Voice Intelligence:** Integrated **Speech-to-Text** for practicing verbal responses.
- **Advanced Diagnostics:** Comprehensive visual reports with **overall scoring, strengths/weaknesses**, and a **30-day mastery roadmap**.
- **Modern SaaS UI:** Stunning dark theme with smooth Framer Motion animations and responsive layouts.
- **Secure Architecture:** JWT-based authentication with refresh tokens and protected routes.

---

## 🛠️ Tech Stack

### Frontend
- **React 18** (Vite)
- **Tailwind CSS** (Styling)
- **Framer Motion** (Animations)
- **Lucide React** (Icons)
- **Axios** (API Calls)
- **Monaco Editor** (Coding questions)

### Backend
- **Node.js** & **Express**
- **MongoDB** (Mongoose)
- **Gemini 1.5 Flash** (AI Services)
- **Multer** (File uploads)
- **PDF-Parse** (Resume text extraction)
- **JWT** (Authentication)

---

## ⚙️ Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Google Gemini API Key

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret
GEMINI_API_KEY=your_gemini_api_key
```
Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:5000/api/v1
```
Start the frontend:
```bash
npm run dev
```

---

## 🚀 Deployment

### Backend (Render / Heroku)
1. Push the code to GitHub.
2. Connect your repository to Render/Heroku.
3. Set the environment variables in the dashboard.
4. Build Command: `npm install`
5. Start Command: `npm start`

### Frontend (Vercel / Netlify)
1. Connet the `frontend/` directory to Vercel.
2. Set `VITE_API_URL` to your deployed backend URL.
3. Build Command: `npm run build`
4. Output Directory: `dist`

---

## 📁 Project Structure

```text
InterviewIQ/
├── backend/                # Express API
│   ├── src/
│   │   ├── controllers/    # Business logic
│   │   ├── models/         # Mongoose schemas
│   │   ├── services/       # AI Integration (Gemini)
│   │   └── server.js       # Entry point
└── frontend/               # React UI
    ├── src/
    │   ├── pages/          # Screens (Landing, Interview, Report)
    │   ├── context/        # Auth state
    │   └── assets/         # Global styles
```
