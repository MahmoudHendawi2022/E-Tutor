import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../context/AuthContext";

function ProtectedRoute({ role }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  if (role && user?.role !== role) {
    return (
      <Navigate
        to={user?.role === "tutor" ? "/tutor/dashboard" : "/dashboard"}
        replace
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
