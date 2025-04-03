import React from "react";

const ActionButton = ({ children, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
        >
            {children}
        </button>
    );
};

export default ActionButton;