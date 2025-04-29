import logo from "../assets/logo.svg";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Button from "./button.jsx"; // 1. Importar o componente Button

// Placeholder for user image
const PlaceholderUserIcon = () => ( <svg className="w-full h-full text-gray-300" fill="currentColor" viewBox="0 0 24 24"> <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /> </svg> );

const ClientHeader = ({ userImage }) => {
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
                    {!user? (<button className="hover:text-black">É uma Empresa de Manutenção?</button>) : null}
                </nav>

                {/* 3. Lógica Condicional: Avatar ou Botões */}
                {user ? (
                    // Se user existe (logado), mostra o avatar e dropdown
                    <div className="relative">
                        <div 
                            className="h-9 w-9 rounded-full overflow-hidden border cursor-pointer bg-gray-100 flex items-center justify-center"
                            onClick={toggleDropdown}
                        >
                            {userImage ? (
                                <img
                                    src={userImage}
                                    alt="Avatar"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <PlaceholderUserIcon />
                            )}
                        </div>
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
                                    onClick={() => navigate('/user/multas')}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    As minhas multas
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
