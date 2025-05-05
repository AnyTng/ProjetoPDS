import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/LoggedOut/loginpageUserPrestador.jsx';
import AdminLogin from '../pages/Admin/loginpageAdmin.jsx';
import RegisterUser from '../pages/LoggedOut/RegisterPageUser.jsx';
import PrivateRoute from './PrivateRoute';

// Public Pages
import EShopPage from "../pages/LoggedOut/eShopPage.jsx";
import CarShop from "../pages/LoggedOut/carShop.jsx";
import RegisterPagePrestador from "../pages/Prestador/registerPrestador.jsx";
import EmpresaManutencaoInfoPage from "../pages/LoggedOut/EmpresaManutencaoInfoPage.jsx";
import SobreNosPage from "../pages/LoggedOut/SobreNosPage.jsx";

//Prestador Pages
import ConcursosPrestador from "../pages/Prestador/ConcursosPrestador.jsx";  // ← only import once
import PropostasPrestador from "../pages/Prestador/PropostasPrestador.jsx";
import HistoricoPropostasPrestador from "../pages/Prestador/HistoricoPropostasPrestador.jsx";
import EditarPerfilPrestador from "../pages/Prestador/EditarPerfil.jsx";


// Payment Pages
import PaymentSuccess from "../pages/Cliente/PaymentSuccess.jsx";
import PaymentFailureAluguer from "../pages/Cliente/PaymentFailureAluguer.jsx";
import PaymentFailureMulta from "../pages/Cliente/PaymentFailureMulta.jsx";
import PaymentSuccessMulta from "../pages/Cliente/PaymentSuccessMulta.jsx";

// Admin Pages
import CarsPageAdmin from '../pages/Admin/carsPageAdmin.jsx';
import ConcursosManAdmin from '../pages/Admin/concursosManAdmin.jsx';
import PropostasPageAdmin from '../pages/Admin/propostasCarroAdmin.jsx';
import MultasPageAdmin from '../pages/Admin/multasPageAdmin.jsx';
import AlugueresPageAdmin from '../pages/Admin/AlugueresPageAdmin.jsx';
import UsersPageAdmin from '../pages/Admin/usersPageAdmin.jsx';


// User Pages
import ClientePerfil from "../pages/Cliente/clientePerfil.jsx";
import CarRent from "../pages/Cliente/AlugarCarroForm.jsx";
import ClienteReservas from "../pages/Cliente/ClienteReservas.jsx";
import ClienteMultas from "../pages/Cliente/ClienteMultas.jsx";


const AppRoutes = () => (
    <Routes>
        {/* --- Rotas Públicas --- */}
        <Route path="/" element={<EShopPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/registerUser" element={<RegisterUser />} />
        <Route path="/eShop" element={<EShopPage />} />
        <Route path="/eShop/:carID" element={<CarShop />} />
        <Route path="/registerPrestador" element={<RegisterPagePrestador />} />
        <Route path="/info-empresa-manutencao" element={<EmpresaManutencaoInfoPage />} />
        <Route path="/nos" element={<SobreNosPage />} />

        {/* --- Rotas Protegidas (Cliente) --- */}
        <Route
            path="/user/profile"
            element={
                <PrivateRoute allowedRoles={['cliente']}>
                    <ClientePerfil />
                </PrivateRoute>
            }
        />

        <Route
            path={"user/multas"}
                element={
                    <PrivateRoute allowedRoles={['cliente']}>
                        <ClienteMultas />
                    </PrivateRoute>
                }
        />

        <Route
            path="/payment/failure/multa"
            element={
                <PrivateRoute allowedRoles={['cliente']}>
                    <PaymentFailureMulta />
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

        {/* --- Rotas Prestador (empresa) --- */}
        <Route
            path="/prestador"
            element={<Navigate to="/prestador/concursos" replace />}
        />
        <Route
            path="/prestador/concursos"
            element={
                <PrivateRoute allowedRoles={['empresa']}>
                    <ConcursosPrestador />
                </PrivateRoute>
            }
        />

        <Route
            path="/prestador/concursos/:concursoId"
            element={
                <PrivateRoute allowedRoles={['empresa']}>
                    <PropostasPrestador />
                </PrivateRoute>
            }
        />

        <Route

            path="/prestador/TodasPropostas"
            element={
                <PrivateRoute allowedRoles={['empresa']}>
                    <HistoricoPropostasPrestador />
                </PrivateRoute>
            }
        />

        <Route
            path="/prestador/perfil"
            element={
                <PrivateRoute allowedRoles={['empresa']}>
                    <EditarPerfilPrestador />
                </PrivateRoute>
            }
        />

        {/* <Route

        {/* --- Rotas do Admin (ID Role = 3) --- */}
        <Route
            path="/admin/dashboard"
            element={
                <PrivateRoute allowedRoles={['admin']}>
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
        <Route
            path="/admin/concursos/:concursoId"
            element={
                <PrivateRoute allowedRoles={['admin']}>
                    <PropostasPageAdmin />
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
            path="/admin/pedidos"
            element={
                <PrivateRoute allowedRoles={['admin']}>
                    <AlugueresPageAdmin />
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
        {/* --- Rotas de Pagamento --- */}
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/success/multa" element={<PaymentSuccessMulta />} />
        <Route path="/payment/failure" element={<PaymentFailureAluguer />} />

        {/* --- Erros / Fallback --- */}
        <Route path="/unauthorized" element={<div>Acesso Não Autorizado</div>} />
        <Route path="*" element={<div>404 - Página Não Encontrada</div>} />
    </Routes>
);

export default AppRoutes;
