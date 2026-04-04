import { createContext, useState, useEffect } from "react";
import { TokenService, UserService } from "../services";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => TokenService.getToken());
  const [user, setUser] = useState(() => UserService.getUser());

  const login = (accessToken, userData) => {
    TokenService.saveToken(accessToken);
    UserService.saveUser(userData);
    setToken(accessToken);
    setUser(userData);
  };

  const logout = () => {
    TokenService.removeToken();
    UserService.removeUser();
    setToken(null);
    setUser(null);
  };

  // Check expiry every 60 seconds instead of every 1 second
  useEffect(() => {
    if (!token) return;

    const checkExpiry = () => {
      const remaining = TokenService.getRemainingTime();
      if (remaining <= 0) {
        logout();
      }
    };

    // Check immediately on mount/token change
    checkExpiry();

    // Then check every 60 seconds
    const interval = setInterval(checkExpiry, 60 * 1000);

    return () => clearInterval(interval);
  }, [token]);

  const value = {
    token,
    user,
    isAuthenticated: !!token,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
