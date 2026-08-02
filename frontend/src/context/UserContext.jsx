import { createContext, useContext, useEffect, useState } from "react";
import { getProfile } from "../services/api";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState({
    name: "",
    email: "",
  });

  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      const data = await getProfile();

      if (!data.error) {
        setUser(data);
      }
    } catch (error) {
      console.error("Failed to load user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        loadUser,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}