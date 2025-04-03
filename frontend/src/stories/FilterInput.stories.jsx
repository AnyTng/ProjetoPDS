import React, { useState } from "react";
import FilterInput from "../components/FilterInput";


export default {
    title: "Componentes/FilterInput",
    component: FilterInput,
};

export const Padrao = () => {
    const [value, setValue] = useState("");
    return (
        <FilterInput
            placeholder="Pesquisar..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
        />
    );
};