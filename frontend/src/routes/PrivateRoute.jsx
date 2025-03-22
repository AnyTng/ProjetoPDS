import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const PrivateRoute = ({ children, allowedRoles }) => {
    const { user } = useAuth();

    if (!user) return <Navigate to="/" />; // Redirect to login if not authenticated
    if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" />;

    return children;
};

export default PrivateRoute;
