import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginApi, meApi, registerApi } from "../api/auth.api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // للتحقق عند بداية التطبيق
  useEffect(() => {
    const init = async () => {
      try {
        if (!token) return;
        const res = await meApi();
        setUser(res.data);
      } catch (e) {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    if (!token) {
      setLoading(false);
      return;
    }

    init();
  }, [token]);

  const register = async (email, password) => {
    await registerApi({ email, password });
  };

  const login = async (email, password) => {
    const res = await loginApi({ email, password });
    const t = res.data.token;
    localStorage.setItem("token", t);
    setToken(t);

    const me = await meApi();
    setUser(me.data);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ token, user, loading, register, login, logout }),
    [token, user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
