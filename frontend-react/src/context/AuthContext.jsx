import { createContext, useContext, useState } from "react";
import { api } from "../api.js";

const AuthContext = createContext(null);

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem("shopnest_auth")) || { user: null, token: null };
  } catch {
    return { user: null, token: null };
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(loadSession);

  const save = (data) => {
    setSession(data);
    localStorage.setItem("shopnest_auth", JSON.stringify(data));
  };

  const login = async (email, password) =>
    save(await api("/auth/login", { method: "POST", body: { email, password } }));

  const register = async (name, email, password) =>
    save(await api("/auth/register", { method: "POST", body: { name, email, password } }));

  const logout = () => {
    setSession({ user: null, token: null });
    localStorage.removeItem("shopnest_auth");
  };

  return (
    <AuthContext.Provider value={{ ...session, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
