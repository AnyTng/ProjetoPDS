// src/pages/cliente/ClienteMultas.jsx

import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../hooks/useAuth";
import { fetchWithAuth } from "../../utils/api";
import ClientHeader from "../../components/clientHeader.jsx";
import Footer from "../../components/footer.jsx";
import MultaCardCliente from "../../components/Cards/multaCardCliente.jsx";

const ClienteMultas = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [multas, setMultas] = useState([]);
    const [userImage, setUserImage] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userName, setUserName] = useState("");

    // Busca perfil
    useEffect(() => {
        if (!user?.id) return;
        fetchWithAuth("/api/clientes/me")
            .then(profile => {
                setUserName(profile.nomeCliente || "");
                setUserImage(profile.imagemBase64 || null);
            })
            .catch(console.error);
    }, [user?.id]);

    // Função para buscar multas do cliente
    const fetchMultas = async () => {
        if (!user?.id) {
            setError("Utilizador não autenticado.");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const data = await fetchWithAuth("/api/Infracoes/MultasCliente");

            if (!Array.isArray(data)) throw new Error("Resposta inesperada.");

            // Ordena da multa mais recente para a mais antiga
            data.sort((a, b) => new Date(b.dataInfracao) - new Date(a.dataInfracao));
            setMultas(data);

            // preenche nome de cliente se vier no payload
            if (data[0]?.aluguerIdaluguerNavigation?.clienteIdclienteNavigation?.nomeCliente) {
                setUserName(data[0].aluguerIdaluguerNavigation.clienteIdclienteNavigation.nomeCliente);
            }
        } catch (err) {
            console.error("Erro ao buscar multas:", err);
            setError(err.message || "Erro ao carregar multas.");

            // se for auth
            if (err.status === 401 || err.status === 403) {
                alert("Sessão expirada. Faça login novamente.");
                logout();
                navigate("/login");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Busca multas do cliente quando o componente monta
    useEffect(() => {
        fetchMultas();
    }, [user?.id, logout, navigate]);

    const PlaceholderUserIcon = () => (
        <svg className="w-full h-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    );

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
            <ClientHeader userImage={userImage} />
            <main className="max-w-7xl mx-auto p-6 flex-grow">
                <h2 className="text-gray-400 text-sm mb-4">Histórico de Multas</h2>
                <div className="bg-white rounded-xl shadow p-6 md:p-10 grid md:grid-cols-3 gap-8 min-h-[400px]">
                    {/* Perfil à esquerda */}
                    <div className="col-span-1 flex flex-col items-center text-center gap-4 pr-10 border-r border-gray-200">
                        <div className="rounded-full w-40 h-40 overflow-hidden bg-gray-100 flex items-center justify-center">
                            {userImage ? (
                                <img src={userImage} alt="Foto do utilizador" className="w-full h-full object-cover" />
                            ) : (
                                <PlaceholderUserIcon />
                            )}
                        </div>
                        <p className="text-lg font-semibold">Olá,</p>
                        <p className={`text-xl font-bold ${error && !isLoading ? "text-red-500" : ""}`}>
                            {isLoading ? "A carregar..." : error ? "Erro" : userName}
                        </p>
                    </div>

                    {/* Lista de Multas */}
                    <div className="col-span-2 flex flex-col gap-6 overflow-y-auto max-h-[600px] pr-2">
                        {isLoading && (
                            <div className="text-center text-gray-500 py-10">
                                A carregar histórico de multas…
                            </div>
                        )}

                        {error && !isLoading && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                <strong className="font-bold">Erro: </strong>
                                <span>{error}</span>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="ml-4 text-sm underline"
                                >
                                    Tentar recarregar
                                </button>
                            </div>
                        )}

                        {!isLoading && !error && multas.length === 0 && (
                            <div className="text-center text-gray-500 py-10">
                                Não foram encontradas multas.
                            </div>
                        )}

                        {!isLoading && multas.map(multa => (
                            <MultaCardCliente 
                                key={multa.idinfracao} 
                                multa={multa} 
                                onUpdate={fetchMultas}
                            />
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ClienteMultas;
