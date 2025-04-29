import React from "react";
import plusIcon from "../assets/PlusIcon.svg";
import xIcon from "../assets/XIcon.svg";
import uploadIcon from "../assets/UploadIcon.svg";
import Checkmark from "../assets/Checkmark.svg";
import "../index.css";
import '../css/global.css'

const ActionButton = ({ type = "none", text = "", onClick }) => {
    let style = "";
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
        case "check":
            style = "bg-[#2C2C2C] hover:bg-[#1a1a1a] text-white";
            iconSrc = Checkmark;
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
            {iconSrc && <img src={iconSrc} alt="" className="w-5 h-5" />}
            {text && <span>{text}</span>}
        </button>
    );
};

export default ActionButton;