import { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../services/api";
import { toast } from "sonner";

const AuthContext = createContext(null);
const normalizeRole = (role) => (role || "").toLowerCase();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser({ ...parsed, role: normalizeRole(parsed.role) });
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password, role) => {
    try {
      const res = await authApi.login({ email, password, role });
      const userData = { ...res.data, role: normalizeRole(res.data.role) };
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      toast.success("Logged in successfully");
      return userData;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Login failed";
      toast.error(msg);
      throw err;
    }
  };

  const register = async (data) => {
    try {
      const res = await authApi.register(data);
      const userData = { ...res.data, role: normalizeRole(res.data.role) };
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      toast.success("Registration successful");
      return userData;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Registration failed";
      toast.error(msg);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    toast.success("Logged out");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
