# 🚀 CSEMastery — 200-Day Computer Science & Software Engineering Roadmap

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.0+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.0+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![SQLite](https://img.shields.io/badge/SQLite-3.0+-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**CSEMastery** is a full-stack, multi-user learning management and habit-building web platform designed to take developers from core computer science fundamentals to production-grade software engineering in a structured **200-Day Curriculum**.

---

## 📌 Features

- 🧠 **Comprehensive 200-Day Curriculum**:
  - **Days 1–70**: Data Structures & Algorithms (Arrays, Linked Lists, Trees, Graphs, DP, Backtracking)
  - **Days 71–90**: Java Core Fundamentals (OOP, Exception Handling, Collections Framework, Streams, Multithreading, JVM Internals)
  - **Days 91–110**: Advanced Java & Frameworks (Spring Boot, Hibernate, REST APIs, Microservices Architecture)
  - **Days 111–130**: Database Management Systems (SQL, Normalization, ACID, Indexing, Transactions, Query Optimization)
  - **Days 131–160**: System Design & Scalability (HLD, LLD, Caching, Load Balancing, Message Queues, Sharding)
  - **Days 161–200**: Real-World Production Projects & Capstone Engineering
- 🔒 **Multi-User Isolation & Security**:
  - Secure token-based authentication (JWT).
  - User progress, tasks, streaks, notes, and metrics are isolated per account.
  - Dedicated default guest account: **Mastery Scholar** for instant demo evaluation.
- 🏆 **Live Competitive Leaderboard**:
  - Real-time ranking based on XP, completed tasks, and streak consistency.
- 📊 **Interactive Analytics & Progress Tracking**:
  - Weekly mastery charts, daily checklist completions, and track-level progress breakdowns.
- 💬 **Community Discussions & Notes**:
  - Markdown-enabled study notes per day/module.
  - Discussion forum for peer reviews, problem-solving, and code sharing.
- ⚡ **Modern Glassmorphic Dark UI**:
  - Fast, responsive design built with React, Lucide icons, and modern animations.

---

## 🛠️ Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript, Lucide React, Modern CSS & Glassmorphism |
| **Backend** | Node.js, Express.js, TypeScript, better-sqlite3 |
| **Database** | SQLite (Normalized multi-tenant schema with Foreign Key constraints) |
| **Testing** | Automated TypeScript test suites for auth, multi-tenant isolation, and curriculum integrity |

---

## 📂 Project Structure

```text
CSEMastery/
├── backend/
│   ├── src/
│   │   ├── controllers/         # Auth, Tasks, Notes, Community, Dashboard controllers
│   │   ├── db/
│   │   │   ├── index.ts         # SQLite connection & schema initialization
│   │   │   ├── seed.ts          # Default seed data & default Mastery Scholar account
│   │   │   └── curriculumBuilder.ts # Dynamic 200-day curriculum generator
│   │   ├── middleware/          # JWT auth & route guards
│   │   ├── routes/              # Express API route declarations
│   │   └── index.ts             # Express server entry point
│   ├── test_multiusers_and_curriculum.ts # Automated test suite
│   ├── package.json
│   └── tsconfig.json
├── database/
│   └── schema.sql               # Full relational database schema definition
├── frontend/
│   ├── src/
│   │   ├── components/          # Header, Sidebar, Badges, Modals
│   │   ├── context/             # AuthContext & Session State
│   │   ├── pages/               # Dashboard, Plan, Tracks, Analytics, Community, LeetCode
│   │   ├── services/            # Axios / Fetch API client layer
│   │   ├── types/               # TypeScript interfaces & types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── .gitignore
├── package.json                 # Monorepo root scripts
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **Git**

---

### 1. Clone the Repository
```bash
git clone https://github.com/Jashvanthan/CSEMastery.git
cd CSEMastery
```

### 2. Backend Setup
```bash
cd backend
npm install

# Start the backend server (runs on http://localhost:5000)
npm run dev
```

### 3. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install

# Start Vite dev server (runs on http://localhost:5173)
npm run dev
```

---

## 🧪 Running Automated Tests

To verify that multi-user isolation, curriculum indexing, authentication guards, and database constraints work flawlessly:

```bash
cd backend
npx ts-node test_multiusers_and_curriculum.ts
```

---

## 📡 Key API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user account |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT token |
| `GET` | `/api/auth/demo-users` | Fetch default evaluation guest profile (`Mastery Scholar`) |
| `GET` | `/api/plan/days` | Fetch 200-day curriculum plan with user completion status |
| `GET` | `/api/plan/days/:id` | Fetch specific day topics, theory, practice tasks, and solutions |
| `POST` | `/api/tasks/:id/toggle` | Toggle task completion status and recalculate user XP/streak |
| `GET` | `/api/dashboard/stats` | Retrieve user-specific analytics, XP, and streak counts |
| `GET` | `/api/community/leaderboard` | Get real-time global leaderboard rankings |

---

## 👤 Author

- **Jashvanthan A** — [GitHub Profile](https://github.com/Jashvanthan)

---

## 📄 License

This project is open-source and licensed under the **MIT License**.
