import React, { useState, useEffect, useCallback } from "react";
import UserContext from "./authContext.js";
import axios from "axios";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");

    try {
      if (storedUser && storedUser !== "undefined") {
        return JSON.parse(storedUser);
      }
    } catch (e) {
      console.warn("❌ Gagal parse localStorage user:", e);
    }

    localStorage.removeItem("user");
    return null;
  });

  const [loading, setLoading] = useState(true);
  const baseURL = import.meta.env.VITE_API_URL;

  const verifyUser = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const response = await axios.get(`${baseURL}/api/auth/verify`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data.success) {
          setUser(response.data.user);
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }
      } else {
        setUser(null);
        localStorage.removeItem("user");
      }
    } catch (error) {
      if (error.response && !error.response.data.error) {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, [baseURL]);

  useEffect(() => {
    verifyUser();
  }, [verifyUser]);

  const login = (user) => {
    setUser(user);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const refreshUser = async () => {
    await verifyUser();
  };

  return (
    <UserContext.Provider
      value={{ user, setUser, login, logout, loading, refreshUser }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default AuthProvider;
