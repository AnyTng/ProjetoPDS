// srcFrontend/pages/Cliente/ClienteReservas.jsx
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../hooks/useAuth";
import { fetchWithAuth } from "../../utils/api"; // Ensure this utility handles errors and JSON correctly
import ClientHeader from "../../components/clientHeader.jsx";
import Footer from "../../components/footer.jsx";
import AluguerCard from "../../components/Cards/aluguerCard.jsx";



// Main component for the client rentals page
const ClienteReservas = () => {
    const { user, logout } = useAuth(); // Get user context and logout function
    const navigate = useNavigate();
    const [alugueres, setAlugueres] = useState([]); // Stores rental history data
    const [userImage, setUserImage] = useState(null); // Stores user profile image URL
    const [isLoading, setIsLoading] = useState(true); // Loading state for initial data fetch
    const [error, setError] = useState(null); // Stores error messages
    const [userName, setUserName] = useState(""); // Stores user name for display

    // Effect Hook to fetch rental history when the component mounts or user context changes
    useEffect(() => {
        const fetchRentalHistory = async () => {
            // Ensure user and user ID are available from context
            if (!user?.id) {
                setError("Utilizador não autenticado ou ID não encontrado.");
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null); // Clear previous errors

            try {
                console.log("Fetching rental history for user login ID:", user.id);
                // Fetch data using the authenticated utility function
                const data = await fetchWithAuth(`/api/Alugueres/historico`); // GET
                console.log("API Data received:", data);

                if (!data) {
                    throw new Error("API não retornou dados de alugueres.");
                }

                // Store the rental history data
                // Sort the data by ID in descending order (highest to lowest)
                const sortedData = Array.isArray(data) 
                    ? [...data].sort((a, b) => b.idaluguer - a.idaluguer) 
                    : [data];
                setAlugueres(sortedData);

                // If we have rental data with client info, set the user name
                if (data.length > 0 && data[0].cliente?.nomeCliente) {
                    setUserName(data[0].cliente.nomeCliente);
                } else {
                    // Fetch user profile to get the name if not available in rental data
                    try {
                        const profileData = await fetchWithAuth(`/api/clientes/me`);
                        if (profileData?.nomeCliente) {
                            setUserName(profileData.nomeCliente);
                        }
                    } catch (profileErr) {
                        console.error("Erro ao buscar nome do utilizador:", profileErr);
                    }
                }

            } catch (err) {
                console.error("Erro ao buscar histórico de alugueres:", err);
                setError(err.message || "Erro ao carregar o histórico de alugueres.");
                setAlugueres([]);

                // Handle authorization errors specifically
                if (err.status === 401 || err.status === 403) {
                    alert("Sessão expirada ou não autorizado. Por favor, faça login novamente.");
                    logout();
                    navigate('/login');
                }
            } finally {
                setIsLoading(false); // Always stop loading indicator
            }
        };

        fetchRentalHistory();
    }, [user?.id, logout, navigate]); // Dependencies ensure effect runs when these change



    // Handle downloading invoice for completed rentals
    const handleDownloadFatura = async (idAluguer) => {
        if (!idAluguer) {
            alert("ID do aluguer não encontrado. Não é possível transferir a fatura.");
            return;
        }

        try {
            // Request the invoice file from the API with authentication
            const response = await fetchWithAuth(`/api/Alugueres/fatura?idAluguer=${idAluguer}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/pdf'
                }
            });

            // Check if response is a valid response object
            if (!(response instanceof Response)) {
                throw new Error("Resposta inválida do servidor");
            }

            // Get the blob from the response
            const blob = await response.blob();

            // Create a URL for the blob
            const url = window.URL.createObjectURL(blob);

            // Create a temporary link element
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `fatura-aluguer-${idAluguer}.pdf`);

            // Append to the document, click it, and remove it
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up the URL object
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Erro ao transferir fatura:", err);
            alert(`Erro ao transferir fatura: ${err.message || "Ocorreu um erro desconhecido."}`);
        }
    };

    // Placeholder for user image
    const PlaceholderUserIcon = () => (
        <svg className="w-full h-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    );

    // ---- JSX Rendering ----
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
            <ClientHeader userImage={userImage} /> {/* Client specific header */}
            <main className="max-w-7xl mx-auto p-6 flex-grow">
                <h2 className="text-gray-400 text-sm mb-4">Histórico de Alugueres</h2>
                <div className="bg-white rounded-xl shadow p-6 md:p-10 grid md:grid-cols-3 gap-8 min-h-[400px]">

                    {/* Left Panel: Image and Greeting */}
                    <div className={`col-span-1 flex flex-col justify-center items-center text-center gap-4 pr-10 border-r border-gray-200`}>
                        <div className="rounded-full w-40 h-40 object-cover border overflow-hidden bg-gray-100 flex items-center justify-center">
                            {userImage ? (<img src={userImage} alt="Foto do utilizador" className="w-full h-full" />) : (<PlaceholderUserIcon />)}
                        </div>
                        <div>
                            <p className="text-lg font-semibold">Olá,</p>
                            <p className={`text-xl font-bold ${error && !isLoading ? 'text-red-500' : ''}`}>
                                {userName || (isLoading ? "A carregar..." : (error ? "Erro" : "Utilizador"))}
                            </p>
                        </div>
                    </div>

                    {/* Right Panel: Rental Cards */}
                    <div className="col-span-2 flex flex-col gap-6 overflow-y-auto max-h-[600px] pr-2">
                        {/* Loading Indicator */}
                        {isLoading && <div className="text-center text-gray-500 py-10">A carregar histórico de alugueres...</div>}

                        {/* Error Display */}
                        {error && !isLoading && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                                <strong className="font-bold">Erro ao carregar alugueres: </strong>
                                <span className="block sm:inline">{error}</span>
                                <button onClick={() => window.location.reload()} className="ml-4 text-sm underline">Tentar Recarregar</button>
                            </div>
                        )}

                        {/* No Rentals Message */}
                        {!isLoading && !error && alugueres.length === 0 && (
                            <div className="text-center text-gray-500 py-10">
                                Não foram encontrados alugueres no seu histórico.
                            </div>
                        )}

                        {/* Rental Cards */}
                        {!isLoading && alugueres.length > 0 && alugueres.map((aluguer) => (
                            <AluguerCard
                                key={aluguer.idaluguer}
                                idaluguer={aluguer.idaluguer}
                                cliente={aluguer.cliente}
                                veiculo={aluguer.veiculo}
                                dataLevantamento={aluguer.dataLevantamento}
                                dataEntregaPrevista={aluguer.dataEntregaPrevista}
                                estadoAluguer={aluguer.estadoAluguer}
                                valorReserva={aluguer.valorReserva}
                                valorQuitacao={aluguer.valorQuitacao}
                                dataDevolucao={aluguer.dataDevolucao}
                                dataFatura={aluguer.dataFatura}
                                classificacao={aluguer.classificacao}
                                onDownloadFatura={handleDownloadFatura}
                            />
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ClienteReservas;
