import {
  FaUser,
  FaLock,
  FaBell,
  FaPalette,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";

function Settings() {
  return (
    <div className="page settings-page">

      <div className="page-header">
        <h1>Settings</h1>

        <p>
          Manage your account and application preferences.
        </p>
      </div>

      <div className="settings-list">

        {/* PROFILE */}

        <NavLink
          to="/profile"
          className="settings-card"
        >
          <div className="settings-card-icon">
            <FaUser />
          </div>

          <div>
            <h3>Profile</h3>

            <p>
              View and update your personal information.
            </p>
          </div>
        </NavLink>

        {/* CHANGE PASSWORD */}

        <NavLink
          to="/change-password"
          className="settings-card"
        >
          <div className="settings-card-icon">
            <FaLock />
          </div>

          <div>
            <h3>Change Password</h3>

            <p>
              Update your account password.
            </p>
          </div>
        </NavLink>

        {/* NOTIFICATIONS */}

        <NavLink
          to="/notifications"
          className="settings-card"
        >
          <div className="settings-card-icon">
            <FaBell />
          </div>

          <div>
            <h3>Notifications</h3>

            <p>
              Stay up to date with your tasks and reminders.
            </p>
          </div>
        </NavLink>

        {/* APPEARANCE */}

        <div className="settings-card settings-card-disabled">
          <div className="settings-card-icon">
            <FaPalette />
          </div>

          <div>
            <h3>Appearance</h3>

            <p>
              Theme and appearance settings.
            </p>
          </div>

          <span className="settings-coming-soon">
            Available
          </span>
        </div>

      </div>
    </div>
  );
}

export default Settings;