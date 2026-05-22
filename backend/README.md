# InterviewIQ - Backend Service 🚀

Welcome to the backend of **InterviewIQ**. This service is built with Node.js, Express, and MongoDB to provide a robust API for AI-powered interview preparation. This README is structured by folder to help you understand the architectural decisions and key concepts for your interview.

---

## 📂 Folder-by-Folder Overview

### 📍 `server.js` (The Entry Point)
- **Concept**: The starting point of the application.
- **Why it matters**: It separates the server listener from the application logic (`app.js`). This is crucial for testing (e.g., using Supertest) where you might want to run the app without binding to a network port.
- **Key Task**: Connects to MongoDB and starts the Express server.

### 📍 `app.js` (Application Configuration)
- **Concept**: Centralized middleware and route configuration.
- **Key Middlewares used**:
    - `helmet()`: Enhances security by setting various HTTP headers.
    - `cors()`: Handles Cross-Origin Resource Sharing, allowing the frontend to talk to the backend.
    - `morgan()`: HTTP request logger for development.
    - `cookieParser()`: Parses cookies for JWT-based authentication.
    - `express.json()`: Middleware to parse JSON bodies.
- **Interview Tip**: Expect questions on **Global Error Handling**. Notice the middleware at the bottom of `app.js` that catches all errors and returns a consistent JSON format.

### 📂 `models/` (Data Architecture)
- **Concept**: Object Data Modeling (ODM) using **Mongoose**.
- **Key Entities**: `User`, `Resume`, `MockInterview`, `Conversation`.
- **Techniques to Mention**:
    - **Pre-save Hooks**: Used in `User.js` to hash passwords using `bcrypt` before they touch the database.
    - **Instance Methods**: `comparePassword` attached directly to the user schema for clean logic in controllers.
    - **Indexing**: Using `unique: true` on fields like email for performance and data integrity.

### 📂 `controllers/` (Business Logic)
- **Concept**: The "C" in MVC. It handles incoming requests and interacts with models.
- **Pattern**: Asynchronous functions using `try-catch` (or an async wrapper) to handle database operations.
- **Core Logic**: `authController` (Login/Register), `interviewController` (starting/ending interviews), and `resumeController`.

### 📂 `routes/` (URL Mapping)
- **Concept**: RESTful API design.
- **Key Practice**: Versioning (`/api/v1/...`). This allows you to update your API without breaking older frontend versions.

### 📂 `middleware/` (The Guardrails)
- **Concept**: Functions that run before the controller.
- **`authMiddleware.js`**: 
    - **JWT Verification**: Extracts the token from the `Authorization` header (`Bearer <token>`).
    - **Role-Based Access Control (RBAC)**: Includes an `authorize()` function to restrict routes to specific roles (e.g., 'admin').

### 📂 `services/` (External Integrations)
- **Concept**: Abstracting complex logic like AI interactions.
- **`aiService.js`**: 
    - Uses **OpenRouter** to communicate with LLMs (Google Gemma-3).
    - **Prompt Engineering**: The logic for generating structured interview questions from resume text.
    - **JSON Parsing**: Includes a "Safe Parser" to ensure the AI's response is valid JSON before the app uses it.

---

## 🧠 Interview Cheat Sheet: Core Concepts

| Concept | Explanation |
| --- | --- |
| **JWT (JSON Web Token)** | A stateless way to handle authentication. The server sends a token; the client stores it and sends it back in the header for every request. |
| **Hashing (Bcrypt)** | A one-way function to hide passwords. Never store plain-text passwords! |
| **MVC Architecture** | Models (Data), Views (UI - handled by React), Controllers (Logic). Keeps code organized and scalable. |
| **REST API** | A standard for building APIs using standard HTTP methods (GET, POST, PUT, DELETE). |
| **ODM (Mongoose)** | Acts as a bridge between Node.js and MongoDB, providing schema validation and easy querying. |
| **Environment Variables** | Using `.env` to store secrets like API keys and DB strings safely. |

---

### 🛠 Tech Stack Summary
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Atlas)
- **Auth**: JWT & Bcryptjs
- **Validation**: Zod
- **AI**: OpenRouter (Gemma-3)
