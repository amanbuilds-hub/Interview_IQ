# InterviewIQ - Frontend Application 🎨

Welcome to the frontend of **InterviewIQ**. This is a modern, responsive React application built with **Vite** and styled with **Tailwind CSS**. This README is structured by folder to help you understand the architectural decisions and key concepts for your interview.

---

## 📂 Folder-by-Folder Overview

### 📍 `main.jsx` (The Entry Point)
- **Concept**: Attaches the React app to the DOM's `root` element.
- **Key Task**: Wraps the entire application in context providers (`BrowserRouter`, `AuthProvider`, etc.) and the global stylesheet.

### 📍 `App.jsx` (Route Configuration)
- **Concept**: Centralized routing logic using **React Router**.
- **Technique to Mention**: 
    - **Protected Routes**: Notice the `<ProtectedRoute>` component wrapping paths like `/dashboard`. This is a custom component that checks for authentication before allowing a user to view that page.
    - **Programmatic Navigation**: Using the `Navigate` component to redirect users who hit unknown routes.

### 📂 `context/` (State Management)
- **Concept**: Using the **Context API** for global state management.
- **Why it matters**: It prevents "prop drilling" (passing data through many layers of components). 
- **`AuthContext.jsx`**: 
    - Manages the logged-in `user` object.
    - Handles login, registration, and logout flows.
    - **Axios Defaults**: Sets `withCredentials = true` and the `Authorization` header globally so you don't have to do it in every file.

### 📂 `hooks/` (Custom Logic)
- **Concept**: Abstracting reusable logic into "Hooks".
- **Interview Tip**: Expect questions on **Clean Code**. Custom hooks allow you to keep your components focused only on the UI while moving data fetching or side effects into separate, testable files.

### 📂 `layouts/` (UI Skeletons)
- **Concept**: Shared UI structures.
- **Example**: `MainLayout.jsx` provides the consistent Sidebar/Navbar/Footer structure used across multiple pages. This makes it easy to change the "shell" of your app in one place.

### 📂 `pages/` (View Layer)
- **Concept**: Represents the different "Screens" of the application.
- **Key Pages**:
    - `Landing.jsx`: The public-facing splash page.
    - `Dashboard.jsx`: The main hub for the user (uses **Framer Motion** for entrance animations).
    - `InterviewScreen.jsx`: The core interactive experience using the **Monaco Editor** for code responses.
    - `ResumeUpload.jsx`: Handles file inputs and interacts with the backend's PDF parsing service.

### 📂 `components/` (Building Blocks)
- **Concept**: Reusable UI elements (Buttons, Cards, Modals).
- **Styling**: Uses **Tailwind CSS** for rapid, utility-first styling and **Lucide-React** for a premium icon set.

### 📂 `services/` (API Communication)
- **Concept**: Abstracting HTTP requests.
- **Why?**: If you need to switch from **Axios** to **Fetch**, or change your API URL, you only have to do it here.

---

## 🧠 Interview Cheat Sheet: Core Concepts

| Concept | Explanation |
| --- | --- |
| **Vite** | A modern build tool that provides incredibly fast development feedback and optimized production builds. |
| **Tailwind CSS** | A utility-first CSS framework that allows for rapid UI development directly in your HTML/JSX. |
| **Framer Motion** | A powerful library for declarative React animations (used for the "Premium" feel of the dashboard). |
| **Axios Interceptors** | Functions that Axios runs for every request/response. Useful for attaching tokens or handling 401 errors globally. |
| **Component Lifecycle** | Using `useEffect` to fetch data when a component mounts and cleaning up resources when it unmounts. |
| **Higher-Order Components** | The `ProtectedRoute` is a form of an HOC/Component Composition that enhances other components with "Auth Logic". |

---

### 🛠 Tech Stack Summary
- **Framework**: React 19 (Vite)
- **Routing**: React Router 7
- **Styling**: Tailwind CSS v4 & Framer Motion
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Code Editor**: Monaco (@monaco-editor/react)
- **Notifications**: React Hot Toast
