import { useState, useEffect } from "react";
import { setAuthTokenGetter } from "@workspace/api-client-react";

export function useAuth() {
  const [token, setTokenState] = useState<string | null>(localStorage.getItem("token"));
  const [adminToken, setAdminTokenState] = useState<string | null>(localStorage.getItem("adminToken"));

  const setToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem("token", newToken);
    } else {
      localStorage.removeItem("token");
    }
    setTokenState(newToken);
  };

  const setAdminToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem("adminToken", newToken);
    } else {
      localStorage.removeItem("adminToken");
    }
    setAdminTokenState(newToken);
  };

  useEffect(() => {
    // The api client only has one auth token getter, we can prioritize admin if we are on an admin route, or just return the appropriate one based on context.
    // For simplicity, we can return admin token if it exists, otherwise user token, but it might leak admin token to user routes.
    // Actually, we can check the window.location.pathname.
    setAuthTokenGetter(() => {
      if (window.location.pathname.startsWith('/admin')) {
        return localStorage.getItem("adminToken");
      }
      return localStorage.getItem("token");
    });
  }, []);

  return { token, setToken, adminToken, setAdminToken };
}
