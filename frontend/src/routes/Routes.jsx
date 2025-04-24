// srcFrontend/routes/Routes.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/LoggedOut/loginpageUserPrestador.jsx';
import AdminLogin from '../pages/Admin/loginpageAdmin.jsx';
import RegisterUser from '../pages/LoggedOut/RegisterPageUser.jsx';
import PrivateRoute from './PrivateRoute';


//Public Pages

import EShopPage from "../pages/LoggedOut/eShopPage.jsx";
import CarShop from "../pages/LoggedOut/carShop.jsx";

// Payment Pages
import PaymentSuccess from "../pages/Cliente/PaymentSuccess.jsx";
import PaymentFailure from "../pages/Cliente/PaymentFailure.jsx";

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
import ClientePerfil from "../pages/Cliente/clientePerfil.jsx";
import CarRent from "../pages/Cliente/AlugarCarroForm.jsx";
import ClienteReservas from "../pages/Cliente/ClienteReservas.jsx";
// Adicionar outras páginas de cliente/empresa aqui...
// import EmpresaDashboard from '../pages/Empresa/EmpresaDashboard.jsx'; // Exemplo


const AppRoutes = () => (
    <Routes>
        {/* --- Rotas Públicas --- */}
        <Route path="/" element={<EShopPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/registerUser" element={<RegisterUser />} />
        <Route path="/eShop" element={<EShopPage />} />
        <Route path="/eShop/:carID" element={<CarShop />} />
        {/* Adicionar rota para /registerEmpresa se existir */}
        {/* <Route path="/registerEmpresa" element={<RegisterEmpresa />} /> */}


        {/* --- Rotas Protegidas --- */}

        {/* Rota do Perfil do Cliente (ID Role = 1) */}
        <Route
            path="/user/profile"
            element={
                // ****** ATUALIZADO PARA 'cliente' ******
                <PrivateRoute allowedRoles={['cliente']}>
                    <ClientePerfil />
                </PrivateRoute>
            }
        />


        <Route
            path="/eShop/rent/:carID"
            element={
                <PrivateRoute allowedRoles={['cliente']}>
                   <CarRent />
                </PrivateRoute>
            }
        />

        <Route
            path="/user/alugueres"
            element={
                <PrivateRoute allowedRoles={['cliente']}>
                   <ClienteReservas />
                </PrivateRoute>
            }
        />

        {/* Exemplo Rota Dashboard Empresa (ID Role = 2) */}
        {/* <Route
            path="/prestador/dashboard"
            element={
                <PrivateRoute allowedRoles={['empresa']}>
                    <EmpresaDashboard />
                </PrivateRoute>
            }
        /> */}


        {/* Rotas do Admin (ID Role = 3) */}
        <Route
            path="/admin/dashboard" // Rota genérica dashboard admin
            element={
                <PrivateRoute allowedRoles={['admin']}>
                    {/* Redireciona para a primeira página real do admin */}
                    <Navigate to="/admin/veiculos" replace />
                </PrivateRoute>
            }
        />
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
        {/* Rota dinâmica para propostas de um concurso específico */}
        <Route
            path="/admin/propostas/:concursoId"
            element={
                <PrivateRoute allowedRoles={['admin']}>
                    <PropostasPageAdmin />
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
            path="/admin/pedidos" // Pedidos de Aluguer
            element={
                <PrivateRoute allowedRoles={['admin']}>
                    <PedidosPageAdmin />
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
        <Route
            path="/admin/notificacoes"
            element={
                <PrivateRoute allowedRoles={['admin']}>
                    <NotificationsPageAdmin />
                </PrivateRoute>
            }
        />
        {/* --- Fim Rotas Admin --- */}


        {/* --- Rotas de Pagamento --- */}
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/failure" element={<PaymentFailure />} />

        {/* --- Rotas de Feedback --- */}
        <Route path="/unauthorized" element={<div>Acesso Não Autorizado</div>} />
        {/* Fallback para Rotas Não Encontradas */}
        <Route path="*" element={<div>404 - Página Não Encontrada</div>} />

    </Routes>
);

export default AppRoutes;
