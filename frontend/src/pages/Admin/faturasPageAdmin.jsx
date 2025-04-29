import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/dashboardLayout.jsx";
import FaturaCard from "../../components/Cards/faturaCard.jsx";
import FilterInput from "../../components/filterInput.jsx";
import FloatingButton from "../../components/floatingButton.jsx";
import { useAuth } from "../../hooks/useAuth.js"; // Adicionar useAuth
import UploadFaturaModal from "../../components/Overlays/UploadFaturaModal.jsx";

// Remover props 'faturas' e 'email'
const FaturasPageAdmin = () => {
    // Estados para dados, loading, erro
    const [faturas, setFaturas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const { user } = useAuth(); // Obter user autenticado

    // Estado para o modal de upload
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    // --- Fetch Inicial de Faturas ---
    const fetchFaturas = async () => { // Tornar reutilizável
        setIsLoading(true);
        setError(null);
        try {
            // SUBSTITUIR '/api/admin/faturas' PELO ENDPOINT REAL
            console.log("[API Placeholder] Fetching faturas...");
            // Simulação - REMOVER/SUBSTITUIR
            await new Promise(resolve => setTimeout(resolve, 500));
            // const data = await fetchWithAuth('/api/admin/faturas');
            // // Garantir que a API retorna os campos necessários para FaturaCard
            // setFaturas(data);

            // Limpar dados mock
            setFaturas([]); // Fica vazio até ter API

        } catch (err) {
            console.error("Erro ao buscar faturas:", err);
            setError(err.message || "Ocorreu um erro ao buscar as faturas.");
            setFaturas([]); // Limpar em caso de erro
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFaturas();
    }, []); // Executa na montagem

    // Filtra faturas baseado no estado local (vindo da API)
    const filtered = !isLoading && !error ? faturas.filter((fatura) =>
        (fatura.CarId?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (fatura.FaturaId?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (fatura.UserId?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (fatura.Servico?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (fatura.Type?.toLowerCase() || "").includes(search.toLowerCase())
    ) : [];

    // --- Handlers do Modal de Upload ---
    const handleOpenUploadModal = () => setIsUploadModalOpen(true);
    const handleCloseUploadModal = () => setIsUploadModalOpen(false);

    const handleUploadFatura = async (formData, file) => {
        console.log("[API Placeholder] Upload Fatura - Dados:", formData);
        console.log("[API Placeholder] Upload Fatura - Ficheiro:", file?.name);

        // 1. Criar FormData para enviar ficheiro + dados
        const dataToSend = new FormData();

        // 2. Adicionar campos do formulário ao FormData
        Object.keys(formData).forEach(key => {
            dataToSend.append(key, formData[key]);
        });

        // 3. Adicionar o ficheiro PDF
        if (file) {
            // O nome 'ficheiroFatura' deve corresponder ao esperado pelo backend
            dataToSend.append('ficheiroFatura', file, file.name);
        } else {
            alert("Nenhum ficheiro PDF selecionado!");
            return; // Abortar se não houver ficheiro
        }

        // 4. LÓGICA DA API (POST /api/admin/faturas/upload ou similar) AQUI...
        //    Enviar 'dataToSend' no body do fetch.
        //    Não definir 'Content-Type' manualmente, o browser fará isso para multipart/form-data.
        // try {
        //    await fetchWithAuth('/api/admin/faturas/upload', {
        //        method: 'POST',
        //        body: dataToSend,
        //    });
        //    await fetchFaturas(); // Re-fetch list on success
        //    handleCloseUploadModal();
        //    alert('Fatura enviada com sucesso!');
        // } catch (err) { console.error("Erro no upload da fatura:", err); alert(`Erro: ${err.message}`); /* Show error */ }

        handleCloseUploadModal(); // Fechar modal (remover qd tiver API real)
        alert('Placeholder: Upload iniciado (ver consola).'); // Remover qd tiver API real
    };
    // --- Fim Handlers ---

    // --- Lógica de Renderização Condicional ---
    let content;
    if (isLoading) {
        content = <div className="p-6 text-center text-gray-500">A carregar faturas...</div>;
    } else if (error) {
        content = <div className="p-6 text-center text-red-600">Erro: {error}</div>;
    } else if (filtered.length === 0) {
        content = (
            <div className="flex justify-center items-center h-64">
                <p className="text-gray-600 text-lg text-center">
                    {search ? "Nenhuma fatura corresponde à pesquisa." : "Não existem faturas registadas."}
                </p>
            </div>
        );
    } else {
        content = (
            <div className="flex flex-col gap-6 pb-6">
                {filtered.map((fatura) => (
                    <FaturaCard
                        key={fatura.FaturaId} // Usar ID único da API
                        // Passar props baseadas nos dados da API
                        Type={fatura.Type}
                        CarId={fatura.CarId}
                        Valor={fatura.Valor}
                        FaturaId={fatura.FaturaId}
                        Data={fatura.Data}
                        UserId={fatura.UserId}
                        Servico={fatura.Servico}
                        // A ação de 'Transferir Fatura' dentro do card continua com o seu placeholder/lógica própria
                    />
                ))}
            </div>
        );
    }
    // --- Fim Lógica Renderização ---

    return (
        <>
            <DashboardLayout
                title="Faturas"
                email={user?.email} // Usa email do user autenticado
                filter={
                    <FilterInput
                        placeholder="Pesquisar por ID fatura/carro/user, tipo..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        disabled={isLoading || !!error}
                    />
                }
                floatingAction={
                    <FloatingButton
                        type="upload" // Mudar ícone para upload
                        text="Enviar Fatura"
                        onClick={handleOpenUploadModal} // Abre modal de upload
                        disabled={isLoading || !!error}
                    />
                }
            >
                {content} {/* Renderiza o conteúdo dinâmico */}
            </DashboardLayout>

            {/* Renderizar Modal de Upload Condicionalmente */}
            <UploadFaturaModal
                isOpen={isUploadModalOpen}
                onClose={handleCloseUploadModal}
                onSubmit={handleUploadFatura} // Passa o handler que cria FormData
            />
        </>
    );
};

export default FaturasPageAdmin;
