// // src/context/AuthContext.jsx
// import { createContext, useState, useEffect } from "react";

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [token, setToken] = useState(localStorage.getItem("token"));

//   useEffect(() => {
//     if (token) localStorage.setItem("token", token);
//     else localStorage.removeItem("token");
//   }, [token]);

//   return (
//     <AuthContext.Provider value={{ token, setToken }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };


// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from "react";
import { TokenService, UserService } from "../services";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => TokenService.getToken());
  const [user, setUser] = useState(() => UserService.getUser());
  const [timeLeft, setTimeLeft] = useState(60);

  const login = (accessToken, userData) => {
    TokenService.saveToken(accessToken);  // ✅ localStorage mein save
    UserService.saveUser(userData);        // ✅ localStorage mein save
    setToken(accessToken);
    setUser(userData);
    setTimeLeft(60);
  };

  const logout = () => {
    TokenService.removeToken();    // ✅ localStorage se DELETE
    UserService.removeUser();      // ✅ localStorage se DELETE
    setToken(null);
    setUser(null);
  };

  // ✨ 1 minute mein auto logout + localStorage clear
  useEffect(() => {
    if (token) {
      const countdownInterval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // ✅ Ye 1 minute baad chalega
            logout(); // localStorage se access_token aur USER_DATA dono delete ho jayenge
            // alert("Session expired! Please login again.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownInterval);
    } else {
      setTimeLeft(60);
    }
  }, [token]);

  const value = {
    token,
    user,
    isAuthenticated: !!token,
    timeLeft,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
