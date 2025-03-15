

const Button = ({ text, variant, type = "button" }) => {
    // Base styles from Figma
    const baseStyles = {
        display: "inline-flex",  // Mudado de "flex" para "inline-flex"
        padding: "12px",
        justifyContent: "center",
        alignItems: "center",
        gap: "8px",
        // Removido flex: "1 0 0" para que os botões não expandam
        fontWeight: "600",
        width:  "auto",
        mx: "auto",
    };

    // Variant-specific styles
    const primaryStyles = {
        borderRadius: "8px",
        border: "1px solid #2C2C2C",
        background: "#2C2C2C",
        color: "white",

    };

    const secondaryStyles = {
        borderRadius: "8px",
        border: "1px solid #2C2C2C",
        background: "white",
        color: "#2C2C2C"


    }

    const defaultStyles = {
        borderRadius: "4px",
        color: "black"

    };

    const combinedStyles = {
        ...baseStyles,
        ...(variant === "primary" ? primaryStyles : {}),
        ...(variant === "secondary" ? secondaryStyles : {}),
        ...(variant !== "primary" && variant !== "secondary" ? defaultStyles : {})
    };

    return (
        <button type={type} style={combinedStyles}>
            {text}
        </button>
    );
};

export default Button;