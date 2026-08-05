import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("ckh_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("ckh_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/api/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("ckh_token");
        localStorage.removeItem("ckh_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const res = await api.post("/api/auth/login", { email, password });
    localStorage.setItem("ckh_token", res.data.token);
    localStorage.setItem("ckh_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  }

  async function register(payload) {
    const res = await api.post("/api/auth/register", payload);
    localStorage.setItem("ckh_token", res.data.token);
    localStorage.setItem("ckh_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  }

  function logout() {
    api.post("/api/auth/logout").catch(() => {});
    localStorage.removeItem("ckh_token");
    localStorage.removeItem("ckh_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  return ctx;
}
