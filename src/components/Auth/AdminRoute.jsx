import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../context/AuthContext";

function AdminRoute() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/admin/signin" replace />;
  if (user?.role !== "admin") {
    return (
      <Navigate
        to={user?.role === "tutor" ? "/tutor/dashboard" : "/dashboard"}
        replace
      />
    );
  }

  return <Outlet />;
}

export default AdminRoute;
