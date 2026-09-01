import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Sidebar from "./components/layout/Sidebar";

import Home from "./pages/Home";
import Important from "./pages/Important";
import Tasks from "./pages/Tasks";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import AISuggestions from "./pages/AISuggestions";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";

import { isLoggedIn } from "./services/api";

import "./styles/App.css";

function ProtectedRoute({ children }) {
  return isLoggedIn() ? (
    children
  ) : (
    <Navigate to="/login" replace />
  );
}

function Layout({ children }) {
  return (
    <div className="app">
      <Sidebar />

      <main className="app-content">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            MY DAY
        ========================= */}

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Home />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* =========================
            IMPORTANT
        ========================= */}

        <Route
          path="/important"
          element={
            <ProtectedRoute>
              <Layout>
                <Important />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* =========================
            TASKS
        ========================= */}

        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <Layout>
                <Tasks />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* =========================
            CALENDAR
        ========================= */}

        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <Layout>
                <Calendar />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* =========================
            SETTINGS
        ========================= */}

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* =========================
            NOTIFICATIONS
        ========================= */}

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Layout>
                <Notifications />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* =========================
            AI SUGGESTIONS
        ========================= */}

        <Route
          path="/ai-suggestions"
          element={
            <ProtectedRoute>
              <Layout>
                <AISuggestions />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* =========================
            PROFILE
        ========================= */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* =========================
            CHANGE PASSWORD
        ========================= */}

        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <Layout>
                <ChangePassword />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* =========================
            AUTHENTICATION
        ========================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        {/* =========================
            FALLBACK
        ========================= */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;