import React from "react";
import plusIcon from "../assets/PlusIcon.svg";
import xIcon from "../assets/XIcon.svg";
import uploadIcon from "../assets/UploadIcon.svg";
import "../index.css";
import '../css/global.css'

const FloatingButton = ({ type = "none", text = "", onClick }) => {
    let style;
    let iconSrc = null;

    switch (type) {
        case "remove":
            style = "bg-red-600 hover:bg-red-700 text-white";
            iconSrc = xIcon;
            break;
        case "add":
            style = "bg-[#2C2C2C] hover:bg-[#1a1a1a] text-white";
            iconSrc = plusIcon;
            break;
        case "upload":
            style = "bg-[#2C2C2C] hover:bg-[#1a1a1a] text-white";
            iconSrc = uploadIcon;
            break;
        case "none":
        default:
            style = "bg-transparent border-none";
            break;
    }

    return (
        <button
            className={`flex items-center gap-2 px-4 py-2 rounded ${style}`}
            onClick={onClick}
        >
            {iconSrc && (
                <img
                    src={iconSrc}
                    alt=""
                    className={`w-5 h-5 ${iconSrc === xIcon ? 'text-white' : ''}`}
                />
            )}
            {text && <span>{text}</span>}
        </button>
    );
};

export default FloatingButton;