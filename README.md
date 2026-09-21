# Frontend Client — Testing & Exam Platform

This is the web frontend for the distributed ed-tech testing platform, built with **Next.js (App Router)**, **Tailwind CSS**, and **Axios**.

It acts as a hybrid Client/BFF (Backend-for-Frontend) layer that routes all network traffic through the **Spring Cloud API Gateway** rather than communicating directly with individual microservices.

---

## 🛠️ Tech Stack

* **Framework:** Next.js (App Router, JavaScript)
* **Styling:** Tailwind CSS
* **HTTP Client:** Axios (centralized interceptors & error normalization)
* **Session & Auth:** `cookies-next` (cookie management for JWT tokens)
* **Code Quality:** ESLint

---

## 📋 Prerequisites

Ensure you have the following installed locally:

* **Node.js:** `v18.17.0` or higher (Node 20 LTS recommended)
* **Package Manager:** `npm` (comes bundled with Node)
* **Backend Services:** The Spring Cloud API Gateway must be running on `http://localhost:8080` to successfully fetch live data.

---

## 🚀 Getting Started

### 1. Clone & Navigate to the Frontend Directory

```bash
git clone <repository-url>
cd frontend

```

### 2. Install Dependencies

```bash
npm install

```

### 3. Setup Environment Variables

Create a `.env.local` file in the root of the `frontend/` directory (or copy from `.env.example` if available):

```env
# Client-side (browser) requests routed through the API Gateway
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:8080/api

# Server-Side Rendering (SSR) & Server Actions internal Gateway URL
INTERNAL_API_GATEWAY_URL=http://localhost:8080/api

```

> **Note:** Do not commit `.env.local` to version control.

### 4. Run the Development Server

```bash
npm run dev

```

Open [http://localhost:3000](http://localhost:3000?utm_source=gemini) in your browser.

---

## 📁 Project Structure

```text
salaar/
├── public/                  # Static assets (images, icons, fonts)
├── src/
│   ├── app/                 # Next.js App Router pages and layouts
│   │   ├── layout.js        # Root application layout
│   │   ├── page.js          # Homepage (SSR catalog preview)
│   │   └── globals.css      # Tailwind base styles
│   ├── components/          # Reusable React components
│   │   ├── common/          # Atomic components (Buttons, Inputs, Modals, Badges)
│   │   └── features/        # Domain-specific UI (TestCard, QuestionPalette, Timer)
│   ├── constants/           # Global enums, routes, and config objects
│   ├── hooks/               # Custom React hooks (useTimer, useAuth)
│   ├── lib/                 # Core utilities and library wrappers
│   │   └── apiClient.js     # Configured Axios instance with auth interceptors
│   └── services/            # API integration layer grouped by domain
│       ├── authService.js   # IAM / authentication calls
│       └── testService.js   # Test catalog and authoring calls
├── .env.local               # Local environment variables
├── next.config.mjs          # Next.js configuration
├── package.json             # Scripts and dependencies
└── tailwind.config.js       # Tailwind theme configuration

```

---

## 📐 Architecture & Development Guidelines

### 1. API Communication via Gateway

Never invoke microservices directly (e.g., calling port 8081 or 8082). Always use the pre-configured Axios instance (`src/lib/apiClient.js`):

```javascript
import apiClient from '@/lib/apiClient';

// Correct: routes to http://localhost:8080/api/tests/...
export const getTests = () => apiClient.get('/tests/public/series');

```

### 2. Service Layer Pattern

Do **not** write raw `apiClient` or `fetch` calls directly inside UI components. All endpoints must be encapsulated within a domain service inside `src/services/`.

### 3. Server Components vs. Client Components

* **Default to Server Components:** Keep pages and data-fetching components as Server Components (no `"use client"` directive) for better performance and SEO.
* **Use Client Components Only When Necessary:** Add `"use client"` at the very top of files that require browser interactivity, state (`useState`, `useEffect`), browser events (`onClick`), or live timers.

---

## 📜 Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Starts the Next.js development server on `http://localhost:3000` with hot reloading |
| `npm run build` | Compiles and builds the production-optimized application |
| `npm run start` | Runs the compiled production build |
| `npm run lint` | Runs ESLint to check for code quality and syntax issues |

---

## 🔍 Troubleshooting

* **Backend Connection Refused (`ECONNREFUSED`):**
Ensure your Spring Boot `api-gateway` is running on port 8080. If your gateway runs on another port, update `NEXT_PUBLIC_API_GATEWAY_URL` in `.env.local`.
* **CORS Errors in the Browser:**
Verify that the API Gateway has `http://localhost:3000` included in its `globalcors` configuration.
* **Port Conflict (Port 3000 in use):**
Run on an alternative port by passing the `-p` flag:
```bash
npm run dev -- -p 3001

```