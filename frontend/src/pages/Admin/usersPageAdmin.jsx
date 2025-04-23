import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/dashboardLayout.jsx";
import UserCard from "../../components/Cards/userCard.jsx";
import FilterInput from "../../components/filterInput.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import UserDetailEditModal from "../../components/Overlays/UserDetailEditModal.jsx"; // Nome sugerido
import { API_BASE_URL, fetchWithAuth } from "../../utils/api";

// Remover props 'users' e 'email'
const UsersPageAdmin = () => {
    // Estados para a lista de utilizadores
    const [users, setUsers] = useState([]);
    const [isLoadingList, setIsLoadingList] = useState(true); // Loading da lista
    const [listError, setListError] = useState(null); // Erro da lista
    const [search, setSearch] = useState("");
    const { user } = useAuth(); // Obter user autenticado

    // Estados para o modal e detalhes do utilizador
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [selectedUserData, setSelectedUserData] = useState(null); // Dados completos do user selecionado
    const [isFetchingDetails, setIsFetchingDetails] = useState(false); // Loading dos detalhes
    const [detailError, setDetailError] = useState(null); // Erro dos detalhes

    // --- Fetch Inicial da Lista de Utilizadores (Dados Básicos) ---
    const fetchUsersList = async () => {
        setIsLoadingList(true);
        setListError(null);
        try {

            console.log("/api/Clientes/listAdmin Fetching users list...");
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulação
            const data = await fetchWithAuth("/api/Clientes/listAdmin");
            // API deve retornar array com pelo menos: id, nome, estado, contacto, imageUrl para o UserCard
            // setUsers(data);

            // Dados Exemplo - REMOVER/SUBSTITUIR

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
    }, []); // Executa na montagem

    // Filtra users baseado na lista (vindo da API)
    const filteredUsers = !isLoadingList && !listError ? users.filter((usr) =>
        (usr.nome?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (usr.contacto?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (usr.id?.toLowerCase() || "").includes(search.toLowerCase())
    ) : [];

    // --- Handlers do Modal ---
    const handleCloseUserModal = () => {
        setIsUserModalOpen(false);
        setSelectedUserData(null);
        setDetailError(null); // Limpa erro dos detalhes ao fechar
    };

    // Abre o modal e busca detalhes completos do utilizador
    const handleOpenUserModal = async (userId) => {
        if (!userId) return;
        setIsUserModalOpen(true); // Abre o modal para mostrar o loading de detalhes
        setIsFetchingDetails(true);
        setDetailError(null);
        setSelectedUserData(null); // Limpa dados antigos

        try {
            // SUBSTITUIR '/api/admin/users/{userId}' PELO ENDPOINT REAL DE DETALHES
            console.log(`[API Placeholder] Fetching details for user ID: ${userId}`);
            await new Promise(resolve => setTimeout(resolve, 800)); // Simulação fetch detalhes
            // const fullUserData = await fetchWithAuth(`/api/admin/users/${userId}`);
            // API deve retornar todos os campos: nome, dataNasc, rua, codPostal, contacto1, contacto2, cartaConducaoNum, cartaConducaoValida (boolean?)
            // setSelectedUserData(fullUserData);





        } catch (err) {
            console.error("Erro ao buscar detalhes do utilizador:", err);
            setDetailError(err.message || "Ocorreu um erro ao buscar os detalhes.");
        } finally {
            setIsFetchingDetails(false);
        }
    };

    // Handler para submeter a atualização do utilizador
    const handleUpdateUser = async (userId, formData) => {
        console.log(`[API Placeholder] Atualizar User ID: ${userId}`, formData);
        // LÓGICA DA API (PUT /api/admin/users/{userId}) AQUI...
        // try {
        //    // Mapear 'valida'/'invalida' de volta para boolean ou o que API esperar, se necessário
        //    const dataToSend = { ...formData, cartaConducaoValida: formData.cartaConducaoValida === 'valida' };
        //    await fetchWithAuth(`/api/admin/users/${userId}`, {
        //         method: 'PUT',
        //         body: dataToSend
        //     });
        //    await fetchUsersList(); // Re-fetch lista para ver mudanças no card
        //    handleCloseUserModal();
        //    alert('Utilizador atualizado com sucesso!');
        // } catch (err) { console.error("Erro ao atualizar utilizador:", err); alert(`Erro: ${err.message}`); /* Show error */ }
        handleCloseUserModal(); // Fechar modal (remover qd tiver API real)
        alert('Placeholder: Atualização enviada (ver consola).'); // Remover qd tiver API real
    };
    // --- Fim Handlers ---

    // --- Lógica de Renderização Condicional da Lista ---
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
                {filteredUsers.map((userItem) => ( // Renomeado para evitar conflito com 'user' do useAuth
                    <UserCard
                        key={userItem.id}
                        userId={userItem.id}
                        estado={userItem.estado}
                        nome={userItem.nome}
                        contacto={userItem.contacto}
                        imageUrl={userItem.imageUrl}
                        // Passa a função para abrir o modal de detalhes/edição
                        onVerInfoClick={() => handleOpenUserModal(userItem.id)}
                    />
                ))}
            </div>
        );
    }
    // --- Fim Lógica Renderização Lista ---

    return (
        <>
            <DashboardLayout
                title="Utilizadores"
                email={user?.email} // Usa email do user autenticado
                filter={
                    <FilterInput
                        placeholder="Pesquisar por nome, contacto ou ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        disabled={isLoadingList || !!listError} // Desativa durante load/erro da LISTA
                    />
                }
                // Sem botão flutuante nesta página por agora
            >
                {listContent} {/* Renderiza o conteúdo dinâmico da lista */}
            </DashboardLayout>

            {/* Renderizar Modal de Detalhes/Edição Condicionalmente */}
            <UserDetailEditModal
                isOpen={isUserModalOpen}
                onClose={handleCloseUserModal}
                onSubmit={handleUpdateUser} // Handler da página para guardar
                userData={selectedUserData} // Dados completos do user (pode ser null inicialmente)
                isLoading={isFetchingDetails} // Estado de loading dos DETALHES
                error={detailError} // Erro ao buscar DETALHES
            />
        </>
    );
};

export default UsersPageAdmin;
