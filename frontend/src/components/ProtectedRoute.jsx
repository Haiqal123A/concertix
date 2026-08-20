import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles = [] }) {
  const location = useLocation();

  const token = sessionStorage.getItem("token");
  const userData = sessionStorage.getItem("user");

  // Belum login
  if (!token || !userData) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  let user;

  try {
    user = JSON.parse(userData);
  } catch (error) {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    return <Navigate to="/login" replace />;
  }

  // Jika route memiliki pembatasan role
  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    // Kalau bukan admin, kembali ke home
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;