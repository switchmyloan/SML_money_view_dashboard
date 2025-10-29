// src/components/ProtectedRoute.jsx
import { Navigate, Outlet  } from "react-router-dom";
import { useAuth } from "../custom-hooks/useAuth";

function ProtectedRoute() {
  const { token } = useAuth();
     console.log(token, "outside")
  if (!token) {
     console.log(token, "inside")
    return <Navigate to="/login" replace />;
  }

return <Outlet />;
}

export default ProtectedRoute;
