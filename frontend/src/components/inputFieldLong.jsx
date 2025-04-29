import React from 'react';

const InputFieldLong = ({
                            id,
                            name,
                            type,
                            value,
                            onChange,
                            placeholder,
                            required,
                            className = "",
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