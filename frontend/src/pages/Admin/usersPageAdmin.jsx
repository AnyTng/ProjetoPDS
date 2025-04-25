import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/dashboardLayout.jsx";
import UserCard from "../../components/Cards/userCard.jsx";
import FilterInput from "../../components/filterInput.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import UserDetailEditModal from "../../components/Overlays/UserDetailEditModal.jsx";
import { API_BASE_URL, fetchWithAuth } from "../../utils/api";

const UsersPageAdmin = () => {
    const [users, setUsers] = useState([]);
    const [isLoadingList, setIsLoadingList] = useState(true);
    const [listError, setListError] = useState(null);
    const [search, setSearch] = useState("");
    const { user } = useAuth();

    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [selectedUserData, setSelectedUserData] = useState(null);
    const [isFetchingDetails, setIsFetchingDetails] = useState(false);
    const [detailError, setDetailError] = useState(null);

    const fetchUsersList = async () => {
        setIsLoadingList(true);
        setListError(null);
        try {
            // Assuming this endpoint returns the array of user objects like the example
            const data = await fetchWithAuth(`/api/Clientes/listAdmin`);
            setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Erro ao buscar lista de utilizadores:", err);
            setListError(err.message || "Ocorreu um erro ao buscar os utilizadores.");
            setUsers([]);
        } finally {
            setIsLoadingList(false);
        }
    };

    useEffect(() => {
        fetchUsersList();
    }, []);

    const filteredUsers = !isLoadingList && !listError ? users.filter((usr) => {
        const searchTerm = search.toLowerCase();
        // Ensure values exist and convert numbers to strings for searching
        const nameMatch = (usr.nomeCliente?.toLowerCase() || "").includes(searchTerm);
        const contactMatch = (usr.contactoC1?.toString().toLowerCase() || "").includes(searchTerm);
        const idMatch = (usr.idcliente?.toString().toLowerCase() || "").includes(searchTerm);
        return nameMatch || contactMatch || idMatch;
    }) : [];

    const handleCloseUserModal = () => {
        setIsUserModalOpen(false);
        setSelectedUserData(null);
        setDetailError(null);
    };

    // Updated to handle the full user data directly from the list response
    // Assuming the list provides enough details or a separate fetch is needed
    const handleOpenUserModal = async (userId) => {
        if (!userId) return;

        // Find the full user data from the fetched list
        const userToOpen = users.find(u => u.idcliente === userId);

        if (userToOpen) {
            setSelectedUserData(userToOpen); // Use the data from the list directly
            setIsUserModalOpen(true);
            setDetailError(null);
            setIsFetchingDetails(false); // No separate fetch needed if list has all data
        } else {
            // If list data is insufficient, you might need a separate fetch here
            console.error("Utilizador não encontrado na lista local.");
            setDetailError("Não foi possível encontrar os dados do utilizador.");
            // Optionally: Trigger a fetch for details if necessary
            // setIsUserModalOpen(true);
            // setIsFetchingDetails(true);
            // setDetailError(null);
            // try {
            //    const fullUserData = await fetchWithAuth(`/api/Clientes/${userId}`); // Example endpoint
            //    setSelectedUserData(fullUserData);
            // } catch (err) { ... } finally { setIsFetchingDetails(false); }
        }
    };




    const handleUpdateUser = async (userId, payload) => {
        // O payload já vem formatado do Modal
        console.log(`A atualizar User ID: ${userId}`, payload);

        try {
            // Usar fetchWithAuth para incluir o token JWT automaticamente
            await fetchWithAuth(`/api/Clientes/EditeClienteAdmin`, {
                method: 'PUT',
                // O fetchWithAuth já define 'Content-Type': 'application/json'
                // e stringify o body
                body: payload
            });

            // Se a API foi bem-sucedida (não lançou erro)
            await fetchUsersList(); // Re-busca a lista para refletir as alterações
            handleCloseUserModal(); // Fecha o modal
            alert('Utilizador atualizado com sucesso!'); // Mensagem de sucesso

        } catch (err) {
            console.error("Erro ao atualizar utilizador:", err);
            // Tentar mostrar uma mensagem de erro mais específica, se disponível
            const errorMsg = err.message || "Ocorreu um erro desconhecido ao guardar as alterações.";
            alert(`Erro ao atualizar: ${errorMsg}`);
            // Poderia guardar o erro no state para mostrar no modal:
            // setSubmitError(errorMsg); // (Necessitaria passar setSubmitError para o modal ou tratar aqui)
            // Não fechar o modal automaticamente em caso de erro, para o user poder corrigir
        }
        // O estado isSubmitting é gerido dentro do modal
    };


    let listContent;
    if (isLoadingList) {
        listContent = <div className="p-6 text-center text-gray-500">A carregar utilizadores...</div>;
    } else if (listError) {
        listContent = <div className="p-6 text-center text-red-600">Erro: {listError}</div>;
    } else if (filteredUsers.length === 0) {
        listContent = (
            <div className="flex justify-center items-center h-64">
                <p className="text-gray-600 text-lg text-center">
                    {search ? "Nenhum utilizador corresponde à pesquisa." : "Não existem utilizadores registados."}
                </p>
            </div>
        );
    } else {
        listContent = (
            <div className="flex flex-col gap-6 pb-6">
                {filteredUsers.map((userItem) => (
                    <UserCard
                        key={userItem.idcliente} // Use unique key
                        userId={userItem.idcliente}
                        estado={userItem.estadoValCc} // Pass boolean state
                        nome={userItem.nomeCliente}
                        contacto={userItem.contactoC1} // Use first contact
                        imageUrl={userItem.imagemBase64} // Pass base64 image string
                        onVerInfoClick={handleOpenUserModal} // Pass the handler directly
                    />
                ))}
            </div>
        );
    }

    return (
        <>
            <DashboardLayout
                title="Utilizadores"
                email={user?.email}
                filter={
                    <FilterInput
                        placeholder="Pesquisar por nome, contacto ou ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        disabled={isLoadingList || !!listError}
                    />
                }
            >
                {listContent}
            </DashboardLayout>

            {/* Pass the correct props based on the new JSON structure */}
            <UserDetailEditModal
                isOpen={isUserModalOpen}
                onClose={handleCloseUserModal}
                onSubmit={handleUpdateUser}
                userData={selectedUserData} // Contains the full user object from the list/fetch
                isLoading={isFetchingDetails}
                error={detailError}
                // Pass idcliente as the identifier
                userId={selectedUserData?.idcliente}
            />
        </>
    );
};

export default UsersPageAdmin;