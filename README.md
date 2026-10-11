
---

## 🛠️ Tech Stack

### 🎨 Frontend

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-FF6B35?style=for-the-badge&logo=react&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![Lucide](https://img.shields.io/badge/Lucide_React-F56565?style=for-the-badge&logo=lucide&logoColor=white)

### ⚙️ Backend

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)
![Bcrypt](https://img.shields.io/badge/bcryptjs-338AF3?style=for-the-badge&logo=letsencrypt&logoColor=white)

### 🗄️ Database

![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white)

### 🚀 DevOps

![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Docker Compose](https://img.shields.io/badge/Docker_Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)

### 🧰 Tools

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)
![npm](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)
![Nodemon](https://img.shields.io/badge/Nodemon-76D04B?style=for-the-badge&logo=nodemon&logoColor=white)

---
# Zyra (SaaS Project Management Platform)

A full-stack project management and collaboration platform inspired by Zyra and Trello. This application enables teams to seamlessly manage workspaces, track tasks across Kanban boards, and collaborate in real-time.

---

## 🚀 Features

### **Authentication & Role Management**
*   Secure **JWT-based** authentication (Register, Login, Session Management).
*   Role-based access control (Admin, User).
*   Encrypted passwords using `bcryptjs`.

### **Workspace & Project Organization**
*   Create distinct projects/workspaces.
*   Manage team members within each project.
*   Customized project keys (e.g., `PR-1`, `TASK-5`) and branding colors.

### **Real-Time Kanban Board**
*   Interactive drag-and-drop task management powered by `@hello-pangea/dnd`.
*   **Real-time synchronization** across all connected clients via `Socket.IO`. (If user A moves a task to 'Done', user B sees it instantly without refreshing).
*   Columns for `To Do`, `In Progress`, and `Done` statuses.

### **Advanced Task Management**
*   Create, view, edit, and delete tasks.
*   Assign tasks to specific team members.
*   Visual indicators for task priorities (`Low`, `Medium`, `High`, `Critical`).
*   Due dates and attachment tracking.

### **Collaboration & Notifications**
*   Real-time commenting system with user avatars and timestamps.
*   Mention users in comments (coming soon).
*   In-app notification system tracking task assignments, updates, and mentions.


## 🛠️ Installation & Setup

### Prerequisites
1.  Node.js installed (v18+ recommended)
2.  MongoDB instance running (Local or MongoDB Atlas)

### 1. Clone & Install Dependencies
First, install dependencies for both the backend and frontend.

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Variables
Create `.env` files in both directories.

**Backend (`backend/.env`):**
```env
NODE_ENV=development
PORT=5001
MONGO_URI=mongodb://localhost:27017/zyra  # Or your MongoDB Atlas URI
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5174
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:5001/api
```

### 3. Run the Application
Open two separate terminal windows.

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

The application should now be running. 
* Frontend: `http://localhost:5174`
* Backend API: `http://localhost:5001`

---

## 📸 Screenshots

*(Replace these with actual screenshots of your application)*
*   **Kanban Board:** Highlighting the drag-and-drop interface.
*   **Task Details:** Showing the commenting system and task metadata.
*   **Dashboard:** Showing the project overview.

---

## 🚢 Deployment (Production)

To deploy the application in production mode using Docker:

### 1. Requirements
- [Docker](https://www.docker.com/get-started) and Docker Compose installed.

### 2. Build & Run
Run the following command in the root directory:

```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

This will:
1. Build the frontend in a temporary container.
2. Copy the build to the backend container.
3. Start a MongoDB instance and the Node.js server.
4. Serve the app at `http://localhost:5001`.

### 3. Production Environment
Make sure to update the environment variables in `docker-compose.prod.yml` (especially `JWT_SECRET`) before deploying.

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.
