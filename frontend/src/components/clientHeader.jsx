import logo from "../assets/logo.svg";
import profilePic from "../assets/react.svg";

const ClientHeader = ({ userImage = profilePic }) => {
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

                <img
                    src={userImage}
                    alt="Avatar"
                    className="h-9 w-9 rounded-full object-cover border"
                />
            </div>
        </header>
    );
};

export default ClientHeader;