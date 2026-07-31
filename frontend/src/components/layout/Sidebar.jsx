import { NavLink, useNavigate } from "react-router-dom";
import {
  FaSun,
  FaStar,
  FaTasks,
  FaUserCircle,
  FaMoon,
  FaSignOutAlt,
} from "react-icons/fa";

import { useTheme } from "../../context/ThemeContext";
import { logout } from "../../services/api";

function Sidebar() {
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-profile">
        <FaUserCircle size={60} />

        <h3>Sheikh Ameen</h3>

        <p>Welcome back 👋</p>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <FaSun />
          <span>My Day</span>
        </NavLink>

        <NavLink
          to="/important"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <FaStar />
          <span>Important</span>
        </NavLink>

        <NavLink
          to="/tasks"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <FaTasks />
          <span>Tasks</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
        >
          {darkMode ? <FaSun /> : <FaMoon />}
          <span>
            {darkMode ? "Light Mode" : "Dark Mode"}
          </span>
        </button>

        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;