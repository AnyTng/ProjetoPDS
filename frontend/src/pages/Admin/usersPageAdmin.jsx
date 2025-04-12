import React, { useState } from "react";
import DashboardLayout from "../../components/dashboardLayout.jsx";
import UserCard from "../../components/Cards/userCard.jsx";
import FilterInput from "../../components/filterInput.jsx";

const UsersPageAdmin = ({ users = [], email = "admin@email.com" }) => {
    const [search, setSearch] = useState("");

    // Filtro por nome ou contacto
    const filtered = users.filter((user) =>
        user.nome?.toLowerCase().includes(search.toLowerCase()) ||
        user.contacto?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout
            title="Utilizadores"
            email={email}
            filter={
                <FilterInput
                    placeholder="Pesquisar utilizadores..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            }
        >
            {filtered.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                    <p className="text-gray-600 text-lg text-center">
                        Nenhum utilizador corresponde à pesquisa.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    {filtered.map((user) => (
                        <UserCard
                            key={user.id}
                            userId={user.id}
                            estado={user.estado}
                            nome={user.nome}
                            contacto={user.contacto}
                            imageUrl={user.imageUrl}
                            onVerInfoClick={() => console.log("Ver info de", user.id)}
                        />
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
};

export default UsersPageAdmin;