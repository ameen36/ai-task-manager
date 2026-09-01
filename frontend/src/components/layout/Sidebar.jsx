import { NavLink, useNavigate } from "react-router-dom";
import {
  FaSun,
  FaStar,
  FaTasks,
  FaCalendarAlt,
  FaRobot,
  FaUserCircle,
  FaMoon,
  FaSignOutAlt,
  FaCog,
} from "react-icons/fa";

import { useTheme } from "../../context/ThemeContext";
import { useUser } from "../../context/UserContext";
import { logout } from "../../services/api";

function Sidebar() {
  const { darkMode, toggleTheme } = useTheme();
  const { user } = useUser();

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="sidebar">

      {/* PROFILE */}

      <div className="sidebar-profile">
        <FaUserCircle size={60} />

        <div>
          <h3>{user?.name || "User"}</h3>
          <p>Welcome back 👋</p>
        </div>
      </div>

      {/* MAIN NAVIGATION */}

      <nav className="sidebar-nav">

        {/* MY DAY */}

        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          <FaSun />
          <span>My Day</span>
        </NavLink>

        {/* IMPORTANT */}

        <NavLink
          to="/important"
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          <FaStar />
          <span>Important</span>
        </NavLink>

        {/* TASKS */}

        <NavLink
          to="/tasks"
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          <FaTasks />
          <span>Tasks</span>
        </NavLink>

        {/* CALENDAR */}

        <NavLink
          to="/calendar"
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          <FaCalendarAlt />
          <span>Calendar</span>
        </NavLink>

        {/* AI SUGGESTIONS */}

        <NavLink
          to="/ai-suggestions"
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          <FaRobot />
          <span>AI Suggestions</span>
        </NavLink>

        {/* SETTINGS */}

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          <FaCog />
          <span>Settings</span>
        </NavLink>

      </nav>

      {/* SIDEBAR FOOTER */}

      <div className="sidebar-footer">

        {/* THEME */}

        <button
          type="button"
          className="theme-toggle-btn"
          onClick={toggleTheme}
        >
          {darkMode ? <FaSun /> : <FaMoon />}

          <span>
            {darkMode
              ? "Light Mode"
              : "Dark Mode"}
          </span>
        </button>

        {/* LOGOUT */}

        <button
          type="button"
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