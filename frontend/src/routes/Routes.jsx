import { Routes, Route } from 'react-router-dom';
import Login from '../pages/loginpageUserPrestador';
import AdminLogin from '../pages/loginpageAdmin';
import Register from '../pages/RegisterPageUser';
import PrivateRoute from './PrivateRoute';

const AppRoutes = () => (
    <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes (Require authentication) */}
        <Route
            path="/dashboard"
            element={
                <PrivateRoute allowedRoles={['user', 'service-provider']}>
                </PrivateRoute>
            }


        />

        <Route
            path="/admin"
            element={
                <PrivateRoute allowedRoles={['admin']}>
                </PrivateRoute>
            }
        />

        {/* Fallback route */}
        <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
);

export default AppRoutes;
