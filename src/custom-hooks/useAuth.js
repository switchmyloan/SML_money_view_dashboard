

// import { useState } from "react";
// import { TokenService, UserService } from ".";

// export function useAuth() {
//   const [token, setToken] = useState(() => TokenService.getToken());
//   const [user, setUser] = useState(() => UserService.getUser());

//   const login = (accessToken, userData) => {
//     TokenService.saveToken(accessToken);
//     UserService.saveUser(userData);
//     setToken(accessToken);
//     setUser(userData);
//   };

//   const logout = () => {
//     TokenService.removeToken();
//     setToken(null);
//     setUser(null);
//   };

//   return {
//     token,
//     user,
//     isAuthenticated: !!token,
//     login,
//     logout,
//   };
// }

import { useState, useEffect } from "react";
import { TokenService, UserService } from ".";
const LOGIN_TIME_KEY = "login_time";
const SESSION_DURATION = 86400;

export function useAuth() {
  const [token, setToken] = useState(() => TokenService.getToken());
  const [user, setUser] = useState(() => UserService.getUser());
  
  // ✨ Calculate initial time left based on login time
  const getInitialTimeLeft = () => {
    const loginTime = localStorage.getItem(LOGIN_TIME_KEY);
    if (!loginTime || !token) return SESSION_DURATION;
    
    const elapsed = Math.floor((Date.now() - parseInt(loginTime)) / 1000);
    const remaining = SESSION_DURATION - elapsed;
    
    return remaining > 0 ? remaining : 0;
  };
  
  const [timeLeft, setTimeLeft] = useState(getInitialTimeLeft);

  const login = (accessToken, userData) => {
    const loginTime = Date.now().toString();
    
    TokenService.saveToken(accessToken);
    UserService.saveUser(userData);
    localStorage.setItem(LOGIN_TIME_KEY, loginTime); // ✅ Login time save
    
    setToken(accessToken);
    setUser(userData);
    setTimeLeft(SESSION_DURATION);
  };

  const logout = () => {
    TokenService.removeToken();
    UserService.removeUser();
    localStorage.removeItem(LOGIN_TIME_KEY); // ✅ Login time delete
    
    setToken(null);
    setUser(null);
    setTimeLeft(SESSION_DURATION);
  };

  // ✨ Auto logout with reload-safe countdown
  useEffect(() => {
    if (token) {
      // Check if already expired on mount/reload
      if (timeLeft <= 0) {
        logout();
        // alert("Session expired! Please login again.");
        return;
      }

      const countdownInterval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            logout();
            // alert("Session expired! Please login again.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownInterval);
    } else {
      setTimeLeft(SESSION_DURATION);
    }
  }, [token]);

  return {
    token,
    user,
    isAuthenticated: !!token,
    timeLeft,
    login,
    logout,
  };
}