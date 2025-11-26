import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import { Navigate, useLocation } from "react-router-dom";

type AuthContextType = {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAdmin: boolean;
  userId: number | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseJwt(token: string | null) {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    const json = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );
    return json as any;
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("authToken")
  );

  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      localStorage.setItem("authToken", token);
    } else {
      delete (api.defaults.headers.common as any).Authorization;
      localStorage.removeItem("authToken");
    }
  }, [token]);

  const login = (t: string) => setToken(t);
  const logout = () => setToken(null);

  const payload = parseJwt(token);
  const isAdmin = !!payload?.admin;
  const userId = payload?.id ? Number(payload.id) : null;

  return (
    <AuthContext.Provider value={{ token, login, logout, isAdmin, userId }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { token, isAdmin } = useAuth();
  const loc = useLocation();
  if (!token) return <Navigate to="/" state={{ from: loc }} replace />;
  if (!isAdmin) {
    alert("Este usuario não é do tipo admin");
    return <Navigate to="/" replace />;
  }
  return children;
};

export default AuthContext;
