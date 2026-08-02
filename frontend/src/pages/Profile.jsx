import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../services/api";
import { useUser } from "../context/UserContext";

function Profile() {
  const { setUser } = useUser();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const data = await getProfile();

      if (data.error) {
        setMessage(data.error);
        return;
      }

      setProfile({
        name: data.name || "",
        email: data.email || "",
      });
    } catch (error) {
      console.error(error);
      setMessage("Failed to load profile.");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const result = await updateProfile(profile);

      if (result.error) {
        setMessage(result.error);
        return;
      }

      // Update the shared user state immediately
      setUser({
        name: profile.name,
        email: profile.email,
      });

      setMessage("Profile updated successfully");
    } catch (error) {
      console.error(error);
      setMessage("Failed to update profile.");
    }
  }

  return (
    <div className="page">
      <h1>My Profile</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Name</label>
          <br />

          <input
            type="text"
            value={profile.name}
            onChange={(e) =>
              setProfile({
                ...profile,
                name: e.target.value,
              })
            }
          />
        </div>

        <br />

        <div>
          <label>Email</label>
          <br />

          <input
            type="email"
            value={profile.email}
            onChange={(e) =>
              setProfile({
                ...profile,
                email: e.target.value,
              })
            }
          />
        </div>

        <br />

        <button type="submit">
          Save Changes
        </button>

        {message && <p>{message}</p>}
      </form>
    </div>
  );
}

export default Profile;