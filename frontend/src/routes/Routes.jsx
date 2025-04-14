import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/loginpageUserPrestador';
import AdminLogin from '../pages/Admin/loginpageAdmin.jsx';
import RegisterUser from '../pages/RegisterPageUser';
import PrivateRoute from './PrivateRoute'; // Certifique-se que a importação está correta

// Admin Pages
import CarsPageAdmin from '../pages/Admin/carsPageAdmin.jsx';
import ConcursosManAdmin from '../pages/Admin/concursosManAdmin.jsx';
import FaturasPageAdmin from '../pages/Admin/faturasPageAdmin.jsx';
import MultasPageAdmin from '../pages/Admin/multasPageAdmin.jsx';
import NotificationsPageAdmin from '../pages/Admin/notificationsPageAdmin.jsx';
import PedidosPageAdmin from '../pages/Admin/pedidosPageAdmin.jsx';
import PropostasPageAdmin from '../pages/Admin/propostasCarroAdmin.jsx';
import UsersPageAdmin from '../pages/Admin/usersPageAdmin.jsx';

//User Pages
import ClientProfile from "../pages/Cliente/clientProfile.jsx";

const AppRoutes = () => (
    <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/registerUser" element={<RegisterUser />} />

        {/* Protected Routes (Require authentication) */}
        <Route
            path="/user/profile"
            element={
                <PrivateRoute allowedRoles={['user']}>
                    {/* Exemplo temporário de dashboard do utilizador */}
                    <div>< ClientProfile /></div>
                </PrivateRoute>
            }
        />

        <Route
            path="/admin/dashboard" // Rota inicial para admin
            element={
                <PrivateRoute allowedRoles={['admin']}>
                    {/* Redireciona para a primeira página real do admin */}
                    <Navigate to="/admin/veiculos" replace />
                </PrivateRoute>
            }
        />

        {/* Admin Specific Routes - AGORA PROTEGIDAS */}
        <Route
            path="/admin/veiculos"
            element={
                <PrivateRoute allowedRoles={['admin']}>
                    <CarsPageAdmin />
                </PrivateRoute>
            }
        />
        <Route
            path="/admin/concursos"
            element={
                <PrivateRoute allowedRoles={['admin']}>
                    <ConcursosManAdmin />
                </PrivateRoute>
            }
        />
        <Route
            path="/admin/faturas"
            element={
                <PrivateRoute allowedRoles={['admin']}>
                    <FaturasPageAdmin />
                </PrivateRoute>
            }
        />
        <Route
            path="/admin/multas"
            element={
                <PrivateRoute allowedRoles={['admin']}>
                    <MultasPageAdmin />
                </PrivateRoute>
            }
        />
        <Route
            path="/admin/notificacoes"
            element={
                <PrivateRoute allowedRoles={['admin']}>
                    <NotificationsPageAdmin />
                </PrivateRoute>
            }
        />
        <Route
            path="/admin/pedidos"
            element={
                <PrivateRoute allowedRoles={['admin']}>
                    <PedidosPageAdmin />
                </PrivateRoute>
            }
        />
        <Route
            path="/admin/propostas/:concursoId" // <--- Rota dinâmica com parâmetro
            element={
                <PrivateRoute allowedRoles={['admin']}>
                    <PropostasPageAdmin />
                </PrivateRoute>
            }
        />
        <Route
            path="/admin/utilizadores"
            element={
                <PrivateRoute allowedRoles={['admin']}>
                    <UsersPageAdmin />
                </PrivateRoute>
            }
        />

        {/* --- Fim das Rotas Admin Protegidas --- */}

        {/* Rota não autorizada (opcional, mas recomendada) */}
        <Route path="/unauthorized" element={<div>Acesso Não Autorizado</div>} />

        {/* Fallback route */}
        <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
);

export default AppRoutes;