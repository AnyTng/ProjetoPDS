import logo from "../assets/logo.svg";
import profilePic from "../assets/react.svg";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const ClientHeader = ({ userImage = profilePic }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { user, logout } = useAuth();
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
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-800">
                    <button className="hover:text-black">Pesquisa</button>
                    <button className="hover:text-black">Contacte-nos</button>
                    <button className="hover:text-black">Sobre Nós</button>
                    <button className="hover:text-black">É uma Empresa de Manutenção?</button>
                </nav>

                <div className="relative">
                    <img
                        src={userImage}
                        alt="Avatar"
                        className="h-9 w-9 rounded-full object-cover border cursor-pointer"
                        onClick={toggleDropdown}
                    />

                    {isDropdownOpen && user && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                            <button 
                                onClick={handleLogout}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                Terminar Sessão
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default ClientHeader;
