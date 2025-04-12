// src/components/inputFieldLong.jsx

import React from 'react'; // Adiciona import do React se não tiver

// Componente corrigido: Renderiza diretamente o input e passa todas as props relevantes
const InputFieldLong = ({
                            id, // Passar ID
                            name, // Passar Name
                            type,
                            value,
                            onChange,
                            placeholder,
                            required, // Passar Required
                            className = "", // Aceita classes extras, com default vazio
                            // Adiciona outras props que o input possa precisar (ex: autoComplete, step, min, max)
                            ...rest // Captura quaisquer outras props (ex: step, min, max)
                        }) => {
    return (
        <input
            id={id} // Usa a prop id
            name={name} // Usa a prop name
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required} // Usa a prop required
            className={`w-full p-2 mt-1 border rounded border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm ${className}`}
            {...rest} // Passa quaisquer outras props para o input (útil para step, min, max, etc.)
        />
    );
};

export default InputFieldLong;