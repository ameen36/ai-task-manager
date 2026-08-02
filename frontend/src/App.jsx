import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "./components/layout/Sidebar";

import Home from "./pages/Home";
import Important from "./pages/Important";
import Tasks from "./pages/Tasks";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";

import { isLoggedIn } from "./services/api";

import "./styles/App.css";

function ProtectedRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
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

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;