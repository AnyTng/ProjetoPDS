import React from "react";
import menuIcon from "../assets/menu.svg"; // substitui pelo ícone real

const Header = ({ userType, email }) => {
    if (userType === "Admin") {
        return (
            <header style={styles.header}>
                <h1 style={styles.title}>Área do administrador</h1>
                <div style={styles.rightSection}>
                    <span>{email}</span>
                    <img src={menuIcon} alt="Menu" style={styles.icon} />
                </div>
            </header>
        );
    }

    if (userType === "Prestador") {
        return (
            <header style={styles.header}>
                <h1 style={styles.title}>Área do Prestador de Serviços</h1>
                <div style={styles.rightSection}>
                    <span>{email}</span>
                    <img src={menuIcon} alt="Menu" style={styles.icon} />
                </div>
            </header>
        );
    }

    if (userType === "Cliente") {
        return (
            <header style={styles.header}>
                <h1 style={styles.title}>Área do Cliente</h1>
                <div style={styles.rightSection}>
                    <span>{email}</span>
                    <img src={menuIcon} alt="Menu" style={styles.icon} />
                </div>
            </header>
        );
    }

    // Se o tipo for desconhecido
    return (
        <header style={styles.header}>
            <h1 style={styles.title}>Área do Utilizador</h1>
            <div style={styles.rightSection}>
                <span>{email}</span>
                <img src={menuIcon} alt="Menu" style={styles.icon} />
            </div>
        </header>
    );
};

const styles = {
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 40px",
        backgroundColor: "#fff",
        borderBottom: "1px solid #ccc",
    },
    title: {
        fontSize: "24px",
        fontWeight: "bold",
    },
    rightSection: {
        display: "flex",
        alignItems: "center",
        gap: "20px",
    },
    icon: {
        width: "30px",
        height: "30px",
        cursor: "pointer",
    },
};

export default Header;