// src/routes/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const PrivateRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    console.log("PrivateRoute: Loading:", loading, "User:", user);

    if (loading) {
        return <div>A verificar autenticação...</div>;
    }

    if (!user) {
        console.log("PrivateRoute: No user, redirecting to /login"); // Ou '/' se for a principal
        return <Navigate to="/login" replace />; // Redireciona para a página de login
    }

    // Verifica se allowedRoles foi fornecido e se a roleName do user está incluída
    if (allowedRoles && !allowedRoles.includes(user.roleName)) { // <-- USA roleName
        console.log(`PrivateRoute: Role mismatch (User: ${user.roleName}, Allowed: ${allowedRoles.join(',')}), redirecting to /unauthorized`);
        return <Navigate to="/unauthorized" replace />;
    }

    console.log("PrivateRoute: Access granted.");
    return children;
};

export default PrivateRoute;