import { useState, useEffect } from "react";
import { TokenService, UserService } from ".";

export function useAuth() {
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

  // Check expiry every 60 seconds (not every 1 second)
  useEffect(() => {
    if (!token) return;

    const checkExpiry = () => {
      const remaining = TokenService.getRemainingTime();
      if (remaining <= 0) {
        logout();
      }
    };

    checkExpiry();
    const interval = setInterval(checkExpiry, 60 * 1000);

    return () => clearInterval(interval);
  }, [token]);

  return {
    token,
    user,
    isAuthenticated: !!token,
    login,
    logout,
  };
}
