import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "./styles/App.css";

import { ThemeProvider } from "./context/ThemeContext";
import { UserProvider } from "./context/UserContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <UserProvider>
        <App />
      </UserProvider>
    </ThemeProvider>
  </React.StrictMode>
);