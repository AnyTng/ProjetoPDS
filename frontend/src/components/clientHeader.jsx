// src/components/clientHeader.jsx
import logo from "../assets/logo.svg";
import profilePic from "../assets/react.svg";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Button from "./button.jsx"; // 1. Importar o componente Button

const ClientHeader = ({ userImage = profilePic }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { user, logout } = useAuth(); // 2. Obter o estado 'user' do contexto
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsDropdownOpen(false);
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    return (
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b shadow-sm w-full">
            <div className="flex items-center">
                <img src={logo} alt="Logo CarXpress" className="h-8 w-auto" />
            </div>

            <div className="flex items-center gap-6">
                {/* Navegação principal - mantém-se */}
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-800">
                    <button className="hover:text-black" onClick={() => navigate('/eShop')}>Pesquisa</button>
                    <button className="hover:text-black">Contacte-nos</button>
                    <button className="hover:text-black">Sobre Nós</button>
                    <button className="hover:text-black">É uma Empresa de Manutenção?</button>
                </nav>

                {/* 3. Lógica Condicional: Avatar ou Botões */}
                {user ? (
                    // Se user existe (logado), mostra o avatar e dropdown
                    <div className="relative">
                        <img
                            src={userImage} // Considerar usar user.profileImageUrl se vier do contexto/API
                            alt="Avatar"
                            className="h-9 w-9 rounded-full object-cover border cursor-pointer"
                            onClick={toggleDropdown}
                        />
                        {/* Dropdown de logout */}
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                                <button
                                    onClick={() => navigate('/user/profile')}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Perfil
                                </button>
                                <button
                                    onClick={() => navigate('/user/alugueres')}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Os meus alugueres
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Terminar Sessão
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    // Se user não existe (logout), mostra os botões de Login e Registar
                    <div className="flex items-center gap-3">
                        <Button
                            text="Login"
                            variant="secondary" // Ou 'text' se preferires
                            onClick={() => navigate('/login')}
                            className="!py-1.5 px-4 text-sm" // Ajusta o padding e tamanho
                        />
                        <Button
                            text="Registar"
                            variant="primary"
                            onClick={() => navigate('/registerUser')}
                            className="!py-1.5 px-4 text-sm" // Ajusta o padding e tamanho
                        />
                    </div>
                )}
            </div>
        </header>
    );
};

export default ClientHeader;
