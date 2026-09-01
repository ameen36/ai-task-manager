# AI Task Manager

A modern full-stack task management application designed to help users organize, prioritize, schedule, and manage their daily tasks efficiently.

The application provides secure authentication, recurring tasks, task categorization, notes, file attachments, calendar management, notifications, AI-powered suggestions, and a responsive productivity dashboard.

---

## ✨ Features

### 🔐 Authentication & Account Management

- Secure JWT-based authentication
- User registration and login
- Protected routes
- User profile management
- Change password
- Forgot password
- Password reset workflow

### ✅ Task Management

- Create, update, and delete tasks
- Mark tasks as completed
- Mark tasks as important
- Search tasks
- Priority levels:
  - High
  - Medium
  - Low
- Task categories:
  - Personal
  - Work
  - Study
  - Health
  - Shopping
  - Others
- Due dates
- Task notes
- Subtasks

### 🔁 Recurring Tasks

- Daily recurrence
- Weekly recurrence
- Monthly recurrence
- Yearly recurrence
- Custom repeat intervals
- Weekly day selection
- Optional recurrence end dates

### 📎 File Attachments

- Upload files to tasks
- Store task attachments
- Download attachments
- Secure attachment access

### 📅 Calendar

- Calendar-based task view
- View tasks according to due dates
- Navigate between dates
- Access scheduled tasks from the calendar

### 🔔 Notifications

- Notification center
- Task-related notifications
- Notification management

### 🤖 AI Suggestions

- AI-powered productivity suggestions
- Task-oriented recommendations
- Dedicated AI Suggestions section

### 📊 Dashboard

- Overall task progress
- Completed task statistics
- Task overview
- Productivity information
- Quick access to important tasks

### ⚙️ Settings

Centralized settings area for:

- Profile
- Password management
- Notifications
- Appearance preferences

### 🎨 User Interface

- Responsive React interface
- Dark mode / light mode
- Modern sidebar navigation
- Search functionality
- Priority and category indicators
- Clean task cards
- Responsive dashboard layout

---

## 🏗️ Technology Stack

### Frontend

- React 19
- React Router
- Vite
- React Icons
- JavaScript
- CSS

### Backend

- Go 1.26.4
- Gin Web Framework
- RESTful API architecture
- JWT authentication
- MongoDB Go Driver

### Database

- MongoDB
- MongoDB Atlas

### Infrastructure & Tools

- Docker
- Docker Compose
- Nginx
- Git
- GitHub
- Visual Studio Code
- Postman

---

## 🏛️ Architecture

The application follows a full-stack architecture:

```text
                    ┌─────────────────────┐
                    │      React UI       │
                    │     Vite Frontend   │
                    └──────────┬──────────┘
                               │
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │      Go + Gin       │
                    │       Backend       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      MongoDB        │
                    │     MongoDB Atlas   │
                    └─────────────────────┘