// src/routes/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const PrivateRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth(); // <-- Obter loading

    console.log("PrivateRoute: Loading state:", loading, "User:", user); // Log para depuração

    // Se ainda estiver a verificar a autenticação, espera
    if (loading) {
        // Pode colocar aqui um componente Spinner ou similar
        return <div>A verificar autenticação...</div>;
    }

    // Se terminou o loading e não há user, redireciona
    if (!user) {
        console.log("PrivateRoute: No user, redirecting to /"); // Log
        // Adicionado 'replace' para não adicionar a página admin ao histórico se for redirecionado
        return <Navigate to="/" replace />;
    }

    // Se há user mas a role não é permitida, redireciona
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        console.log(`PrivateRoute: Role mismatch (User: ${user.role}, Allowed: ${allowedRoles}), redirecting to /unauthorized`); // Log
        return <Navigate to="/unauthorized" replace />;
    }

    // Se passou por tudo, mostra a página protegida
    console.log("PrivateRoute: Access granted."); // Log
    return children;
};

export default PrivateRoute;