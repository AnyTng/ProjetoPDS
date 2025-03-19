const Button = ({ text, variant, type = "button", onClick }) => { // Accept onClick as a prop
    const baseStyles = {
        display: "inline-flex",
        padding: "12px",
        justifyContent: "center",
        alignItems: "center",
        gap: "8px",
        fontWeight: "600",
        width: "auto",
        mx: "auto",
    };

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
    };

    const textButtonStyles = {
        borderRadius: "8px",
        border: "transparent",
        background: "transparent",
        color: "#2C2C2C",
        textDecoration: "underline"
    };

    const defaultStyles = {
        borderRadius: "4px",
        color: "black"
    };

    const combinedStyles = {
        ...baseStyles,
        ...(variant === "primary" ? primaryStyles : {}),
        ...(variant === "secondary" ? secondaryStyles : {}),
        ...(variant === "text" ? textButtonStyles : {}),
        ...(variant !== "primary" && variant !== "secondary" && variant !=="text" ? defaultStyles : {})
    };

    return (
        <button type={type} onClick={onClick} style={combinedStyles}> {/* Pass onClick here */}
            {text}
        </button>
    );
};

export default Button;