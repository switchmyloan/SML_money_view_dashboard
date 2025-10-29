import { useState } from "react";
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
    // UserService.removeUser();
    setToken(null);
    setUser(null);
  };

  return {
    token,
    user,
    isAuthenticated: !!token,
    login,
    logout,
  };
}
