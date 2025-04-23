import React, { useState, useEffect } from "react"; // Adicionar useEffect
import { useParams } from "react-router-dom"; // Adicionar useParams
import DashboardLayout from "../../components/dashboardLayout.jsx";
import PropostaCardAdmin from "../../components/Cards/propostaCardAdmin.jsx";
import FilterInput from "../../components/filterInput.jsx";
import FloatingButton from "../../components/floatingButton.jsx";
import { useAuth } from "../../hooks/useAuth.js"; // Adicionar useAuth
import { API_BASE_URL, fetchWithAuth } from "../../utils/api";

// Remover props 'pedidos' e 'email'
const PropostasPageAdmin = () => {
    // Ler o ID do concurso da URL
    const { concursoId } = useParams();

    // Estados para propostas, loading, erro
    const [propostas, setPropostas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    // Poderia ter estado para info do concurso (nome carro, etc) se API trouxer
    // const [concursoInfo, setConcursoInfo] = useState(null);
    const [search, setSearch] = useState("");
    const { user } = useAuth(); // Obter user autenticado

    // --- Fetch Inicial de Propostas para este Concurso ---
    const fetchPropostas = async () => {
        if (!concursoId) return; // Não faz fetch se não houver ID

        setIsLoading(true);
        setError(null);
        try {
            // SUBSTITUIR PELO ENDPOINT REAL, usando concursoId
            console.log(`[API Placeholder] Fetching propostas para concurso ID: ${concursoId}`);
            // Simulação - REMOVER/SUBSTITUIR
            await new Promise(resolve => setTimeout(resolve, 500));
            // const data = await fetchWithAuth(`/api/admin/concursos/${concursoId}/propostas`);
            // API deve retornar array de propostas
            // // Assumir que cada 'proposta' em 'data' tem: propostaId, CarroId, CarroNome, EmpresaNome, Data, Valor, TipoManutencao
            // setPropostas(data);

            // Limpar dados mock - começa vazio ou com erro
            setPropostas([]); // Garantir que fica vazio até ter API real

        } catch (err) {
            console.error("Erro ao buscar propostas:", err);
            setError(err.message || "Ocorreu um erro ao buscar as propostas.");
            setPropostas([]); // Limpar em caso de erro
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPropostas();
        // Re-fetch se o concursoId mudar (embora improvável neste fluxo)
    }, [concursoId]);

    // Filtra propostas baseado no estado local (vindo da API)
    const filtered = !isLoading && !error ? propostas.filter((proposta) =>
        (proposta.EmpresaNome?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (proposta.TipoManutencao?.toLowerCase() || "").includes(search.toLowerCase())
    ) : [];

    // --- Handlers para Aceitar/Rejeitar Proposta ---
    // Nota: Estes handlers precisam do ID da *proposta*, não do concurso.
    // Assumindo que a API retorna um 'propostaId' para cada proposta.
    const handleAceitar = async (propostaId) => {
        console.log(`[API Placeholder] Aceitar proposta ID: ${propostaId} para concurso ID: ${concursoId}`);
        // LÓGICA DA API (POST /api/admin/propostas/{propostaId}/aceitar ou similar) AQUI...
        // try {
        //    await fetchWithAuth(`/api/admin/propostas/${propostaId}/aceitar`, { method: 'POST' });
        //    // Talvez navegar de volta para concursos ou mostrar estado 'aceite'
        //    await fetchPropostas(); // Ou atualizar estado local
        // } catch (err) { console.error("Erro ao aceitar proposta:", err); /* Show error */ }
    };

    const handleRejeitar = async (propostaId) => {
        console.log(`[API Placeholder] Rejeitar proposta ID: ${propostaId} para concurso ID: ${concursoId}`);
        // LÓGICA DA API (POST ou DELETE /api/admin/propostas/{propostaId}) AQUI...
        // try {
        //    await fetchWithAuth(`/api/admin/propostas/${propostaId}/reject`, { method: 'POST' }); // ou DELETE
        //    await fetchPropostas(); // Re-fetch para remover da lista
        // } catch (err) { console.error("Erro ao rejeitar proposta:", err); /* Show error */ }
    };

    // --- Handler para Cancelar Concurso ---
    const handleCancelConcurso = async () => {
        if (window.confirm(`Tem a certeza que quer terminar e cancelar o concurso ${concursoId}? Esta ação não pode ser desfeita.`)) {
            console.log(`[API Placeholder] Terminar e cancelar concurso ID: ${concursoId}`);
            // LÓGICA DA API (DELETE /api/admin/concursos/{concursoId} ou PUT para mudar estado) AQUI...
            // try {
            //    await fetchWithAuth(`/api/admin/concursos/${concursoId}`, { method: 'DELETE' }); // ou PUT
            //    // Navegar de volta para a lista de concursos ou mostrar mensagem
            //    // navigate('/admin/concursos');
            //    alert('Concurso cancelado com sucesso.');
            // } catch (err) { console.error("Erro ao cancelar concurso:", err); /* Show error */ }
        }
    };

    // --- Lógica de Renderização Condicional ---
    let content;
    if (isLoading) {
        content = <div className="p-6 text-center text-gray-500">A carregar propostas...</div>;
    } else if (error) {
        content = <div className="p-6 text-center text-red-600">Erro: {error}</div>;
    } else if (filtered.length === 0) {
        content = (
            <div className="flex justify-center items-center h-64">
                <p className="text-gray-600 text-lg text-center">
                    {search ? "Nenhuma proposta corresponde à pesquisa." : `Não existem propostas para o concurso ${concursoId}.`}
                </p>
            </div>
        );
    } else {
        content = (
            <div className="flex flex-col gap-6 pb-6">
                {filtered.map((proposta) => (
                    <PropostaCardAdmin
                        key={proposta.propostaId} // !! Usar um ID único da proposta !!
                        // Passar props baseadas nos dados da API para a proposta
                        CarroId={proposta.CarroId}
                        CarroNome={proposta.CarroNome}
                        EmpresaNome={proposta.EmpresaNome}
                        Data={proposta.Data}
                        Valor={proposta.Valor}
                        TipoManutencao={proposta.TipoManutencao}
                        // Passar handlers com o ID da proposta específica
                        onAceitar={() => handleAceitar(proposta.propostaId)}
                        onRejeitar={() => handleRejeitar(proposta.propostaId)}
                    />
                ))}
            </div>
        );
    }
    // --- Fim Lógica Renderização ---

    return (
        <DashboardLayout
            // Título dinâmico (opcional, pode precisar buscar nome do carro, etc.)
            title={`Propostas para Concurso ${concursoId || '...'}`}
            email={user?.email} // Usa email do user autenticado
            filter={
                <FilterInput
                    placeholder="Pesquisar por nome da empresa ou tipo..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    disabled={isLoading || !!error}
                />
            }
            floatingAction={
                <FloatingButton
                    type="remove"
                    text="Terminar e cancelar concurso"
                    onClick={handleCancelConcurso} // Handler para cancelar
                    disabled={isLoading || !!error || propostas.length === 0} // Desativar se não houver propostas ou a carregar/erro
                />
            }
        >
            {content} {/* Renderiza o conteúdo dinâmico */}
        </DashboardLayout>
    );
};

export default PropostasPageAdmin;
