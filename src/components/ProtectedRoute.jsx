// // src/components/ProtectedRoute.jsx
// import { Navigate, Outlet  } from "react-router-dom";
// import { useAuth } from "../custom-hooks/useAuth";

// function ProtectedRoute() {
//   const { token } = useAuth();
//      console.log(token, "outside")
//   if (!token) {
//      console.log(token, "inside")
//     return <Navigate to="/login" replace />;
//   }

// return <Outlet />;
// }

// export default ProtectedRoute;



// src/components/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../custom-hooks/useAuth";
import { routes } from "../routes/routes";

export default function ProtectedRoute() {
  const { token, user } = useAuth();
  const location = useLocation();

  // console.log("Protected Route Check:", token);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const currentRoute = routes.find(r => r.path === location.pathname);

  if (currentRoute?.roles && !currentRoute.roles.includes(user?.role)) {
    // 🚫 User role is not allowed → redirect to home
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}