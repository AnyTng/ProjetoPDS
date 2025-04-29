import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/dashboardLayout.jsx";
import PropostaCardAdmin from "../../components/Cards/propostaCardAdmin.jsx";
import FilterInput from "../../components/filterInput.jsx";
import ActionButton from "../../components/actionButton.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { fetchWithAuth } from "../../utils/api";

const PropostasPageAdmin = () => {
    const { concursoId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [search, setSearch] = useState("");
    const [propostas, setPropostas] = useState([]);
    const [concursoState, setConcursoState] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Busca as propostas
    const fetchPropostas = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchWithAuth(
                `/api/Manutencoes/VerPropostaAdmin?idConcurso=${concursoId}`
            );
            setPropostas(data);
        } catch (err) {
            console.error("Erro ao buscar propostas:", err);
            setError(err.message || "Não foi possível carregar as propostas.");
        } finally {
            setIsLoading(false);
        }
    }, [concursoId]);

    // Busca o estado do concurso
    const fetchConcursoState = useCallback(async () => {
        try {
            const all = await fetchWithAuth("/api/Despesas/Concursos");
            const found = all.find(c => String(c.iddespesa) === concursoId);
            setConcursoState(found?.estadoConcurso || null);
        } catch (err) {
            console.error("Erro ao buscar estado do concurso:", err);
        }
    }, [concursoId]);

    useEffect(() => {
        fetchPropostas();
        fetchConcursoState();
    }, [fetchPropostas, fetchConcursoState]);

    // Aceita a proposta e volta à lista de concursos
    const handleAccept = async (idmanutencao) => {
        if (!window.confirm("Confirmar aceitação desta proposta?")) return;
        try {
            await fetchWithAuth(
                `/api/Manutencoes/AceitarProposta?idProposta=${idmanutencao}`,
                { method: "PUT" }
            );
            // após aceitar, redireciona de volta à lista de concursos
            navigate("/admin/concursos");
        } catch (err) {
            console.error("Erro ao aceitar proposta:", err);
            alert(`Não foi possível aceitar a proposta: ${err.message}`);
        }
    };

    // Cancela o concurso (só se estiver Ativo)
    const handleCancelConcurso = async () => {
        if (!window.confirm("Tem certeza que deseja cancelar este concurso?")) return;
        try {
            await fetchWithAuth(
                `/api/Despesas/CancelarConcurso?id=${concursoId}`,
                { method: "PUT" }
            );
            navigate("/admin/concursos");
        } catch (err) {
            console.error("Erro ao cancelar concurso:", err);
            alert(`Não foi possível cancelar o concurso: ${err.message}`);
        }
    };

    const handleReturnVehicle = async () => {
        if (!window.confirm("Tem certeza que deseja marcar o veículo como devolvido?")) return;
        try {
            await fetchWithAuth(
                `/api/Despesas/TerminoConcurso?id=${concursoId}`,
                { method: "PUT" }
            );
            navigate("/admin/concursos");
        } catch (err) {
            console.error("Erro ao marcar veículo como devolvido:", err);
            alert(`Não foi possível marcar o veículo como devolvido: ${err.message}`);
        }
    };


    const filtered = !isLoading && !error
        ? propostas.filter(p =>
            p.descProposta.toLowerCase().includes(search.toLowerCase()) ||
            p.valorProposta.toString().includes(search)
        )
        : [];

    let content;
    if (isLoading) {
        content = <div className="p-6 text-center text-gray-500">A carregar propostas…</div>;
    } else if (error) {
        content = <div className="p-6 text-center text-red-600">{error}</div>;
    } else if (filtered.length === 0) {
        content = (
            <div className="flex justify-center items-center h-64">
                <p className="text-gray-600 text-lg text-center">Nenhuma proposta encontrada.</p>
            </div>
        );
    } else {
        content = (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 p-6">
                {filtered.map(p => (
                    <PropostaCardAdmin
                        key={p.idmanutencao}
                        idmanutencao={p.idmanutencao}
                        descProposta={p.descProposta}
                        valorProposta={p.valorProposta}
                        estadoProposta={p.estadoProposta}
                        dataInicioMan={p.dataInicioMan}
                        nomeEmpresa={p.empresaIdempresaNavigation.nomeEmpresa}
                        dataFimMan={p.dataFimMan}
                        concursoState={concursoState}
                        onAceitar={handleAccept}
                    />
                ))}
            </div>
        );
    }

    return (
        <DashboardLayout
            title={`Propostas do Concurso #${concursoId}`}
            email={user?.email}
            filter={
                <FilterInput
                    placeholder="Pesquisar por descrição ou valor…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            }
            floatingAction={
                concursoState === "Ativo" ? (
                    <ActionButton
                        type="remove"
                        text="Cancelar Concurso"
                        onClick={handleCancelConcurso}
                        disabled={isLoading || !!error || propostas.length === 0}
                    />
                ) : concursoState === "Em Manutencao" ? (
                    <ActionButton
                        type="check"
                        text="Veículo Devolvido"
                        onClick={handleReturnVehicle} // or handleVeiculoDevolvido if you have a separate handler
                        disabled={isLoading || !!error || propostas.length === 0}
                    />
                ) : null
            }>


            {content}
        </DashboardLayout>
    );
};

export default PropostasPageAdmin;