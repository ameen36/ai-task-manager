import { useState } from "react";
import { changePassword } from "../services/api";

function ChangePassword() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    setMessage("");
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setMessage("");
    setError("");

    if (
      !formData.currentPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (formData.newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError("New password must be different from current password.");
      return;
    }

    try {
      setLoading(true);

      const result = await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      setMessage(result.message || "Password changed successfully.");

      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error(err);
      setError("Failed to change password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <h1>Change Password</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Current Password</label>
          <br />

          <input
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            autoComplete="current-password"
          />
        </div>

        <br />

        <div>
          <label>New Password</label>
          <br />

          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            autoComplete="new-password"
          />
        </div>

        <br />

        <div>
          <label>Confirm New Password</label>
          <br />

          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
          />
        </div>

        <br />

        <button type="submit" disabled={loading}>
          {loading ? "Changing..." : "Change Password"}
        </button>

        {error && <p>{error}</p>}
        {message && <p>{message}</p>}
      </form>
    </div>
  );
}

export default ChangePassword;