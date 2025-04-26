import React, { useState } from "react"; // Importar useState
import { useNavigate } from "react-router-dom"; // Importar useNavigate
import { useAuth } from "../hooks/useAuth"; // Importar useAuth
import MenuBar from "./Overlays/menuBar.jsx"; // Importar MenuBar
import menuIcon from "../assets/menu.svg";

const Header = ({ userType, email }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false); // 1. Estado para controlar o menu
    const navigate = useNavigate();
    const { logout } = useAuth(); // 2. Obter a função logout do contexto

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen); // 3. Função para abrir/fechar o menu
    };

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false); // Fecha o menu ao fazer logout
        navigate("/"); // Redireciona para a página de login após logout
    };

    // 4. Definir itens do menu para Admin
    const adminMenuItems = [
        { label: "Multas", onClick: () => { navigate("/admin/multas"); setIsMenuOpen(false); } },
        { label: "Faturas", onClick: () => { navigate("/admin/faturas"); setIsMenuOpen(false); } },
        { label: "Veículos", onClick: () => { navigate("/admin/veiculos"); setIsMenuOpen(false); } },
        { label: "Pedidos/Alugueres", onClick: () => { navigate("/admin/pedidos"); setIsMenuOpen(false); } },
        { label: "Notificações", onClick: () => { navigate("/admin/notificacoes"); setIsMenuOpen(false); } },
        { label: "Utilizadores", onClick: () => { navigate("/admin/utilizadores"); setIsMenuOpen(false); } },
        { label: "Concursos", onClick: () => { navigate("/admin/concursos"); setIsMenuOpen(false); } },
    ];

    // 5. Definir itens do menu para Prestador
    const prestadorMenuItems = [
        { label: "Concursos", onClick: () => { navigate("/prestador/Concursos"); setIsMenuOpen(false); } },
    ];

    // Determinar quais itens mostrar com base no userType
    let menuItemsToShow = [];
    if (userType === "Admin") {
        menuItemsToShow = adminMenuItems;
    } else if (userType === "Prestador") {
        menuItemsToShow = prestadorMenuItems;
    }
    // Adicionar lógica para Cliente se necessário, ou manter vazio/outro comportamento.

    // Simplificar a lógica de renderização do título
    let title = "Área do Utilizador";
    if (userType === "Admin") title = "Área do administrador";
    else if (userType === "Prestador") title = "Área do Prestador de Serviços";
    else if (userType === "Cliente") title = "Área do Cliente";


    return (
        // Usar relative positioning no header para que o menu absoluto se posicione corretamente
        <header style={{ ...styles.header, position: 'relative' }}>
            <h1 style={styles.title}>{title}</h1>
            <div style={styles.rightSection}>
                <span style={styles.email}>{email}</span>
                {/* 6. Tornar o ícone clicável */}
                <button onClick={toggleMenu} style={styles.menuButton}>
                    <img src={menuIcon} alt="Menu" style={styles.icon} />
                </button>
            </div>

            {/* 7. Renderizar MenuBar condicionalmente */}
            {isMenuOpen && (
                <div style={styles.menuBarContainer}>
                    <MenuBar
                        menuItems={menuItemsToShow}
                        onLogout={handleLogout} // Passar a função de logout
                    />
                </div>
            )}
        </header>
    );
};

// Ajustar estilos para o botão e posicionamento do menu
const styles = {
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 40px",
        backgroundColor: "#fff",
        borderBottom: "1px solid #ccc",
        // position: 'relative' // Adicionado inline para clareza
    },
    title: {
        fontSize: "24px",
        fontWeight: "bold",
        margin: 0, // Remover margem padrão do h1
    },
    rightSection: {
        display: "flex",
        alignItems: "center",
        gap: "20px",
    },
    // Estilo para o botão que envolve o ícone
    menuButton: {
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        display: 'flex', // Para alinhar a imagem corretamente se necessário
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        width: "30px",
        height: "30px",
        // cursor: "pointer", // Movido para o botão
    },
    // Estilo para o container do MenuBar
    menuBarContainer: {
        position: 'absolute',
        top: '100%', // Posiciona logo abaixo do header
        right: '20px', // Alinha à direita (ajustar conforme padding do header)
        marginTop: '5px', // Pequeno espaço entre header e menu
        zIndex: 1000, // Garante que fica sobre outro conteúdo
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Sombra opcional
        borderRadius: '4px', // Borda arredondada opcional
    },
    // Estilo para o email do usuário
    email: {
        fontSize: '16px',
        fontWeight: '500',
        color: '#4a5568',
        padding: '4px 8px',
        backgroundColor: '#f7fafc',
        borderRadius: '4px',
        border: '1px solid #e2e8f0'
    }
};

export default Header;
