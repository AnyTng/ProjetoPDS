// srcFrontend/pages/Cliente/clientProfile.jsx
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../hooks/useAuth";
import { fetchWithAuth } from "../../utils/api"; // IMPORTAR fetchWithAuth
import ClientHeader from "../../components/clientHeader.jsx";
// import ClientSidebarPanel from "../../components/clientSideBarPanel.jsx"; // Pode remover se não usar mais
import InputFieldLong from "../../components/inputFieldLong.jsx";
import Button from "../../components/button.jsx";

// Estrutura inicial do formulário
const initialFormStructure = [
    { key: 'nomeCliente', label: "Nome", value: "" }, // Chave ajustada para nomeCliente
    { key: 'email', label: "Email", value: "", readOnly: true }, // Email não deve ser editável aqui
    { key: 'contactoC1', label: "Telefone", value: "" }, // Chave ajustada para contactoC1
    { key: 'ruaCliente', label: "Morada", value: "" }, // Chave ajustada para ruaCliente
    { key: 'codigoPostal', label: "Código Postal", value: "" }, // Chave ajustada para codigoPostal
    { key: 'localidade', label: "Localidade", value: ""}, // Adicionado
    { key: 'nifcliente', label: "NIF", value: "", readOnly: true }, // Chave ajustada para nifcliente
];

// Função para mapear dados da API para o formulário
const transformApiDataToFormData = (apiData, userEmail) => {
    if (!apiData) return initialFormStructure.map(f => ({...f, value: f.key === 'email' ? userEmail || '' : ''}));

    // Mapeia a estrutura, preenchendo com dados da API
    return initialFormStructure.map(field => ({
        ...field,
        // Usa a chave correta para buscar no objeto 'apiData'
        // Trata CP e NIF como strings no form, mesmo que sejam int na API
        // Adiciona o email do contexto se a API não o trouxer explicitamente
        value: field.key === 'email' ? userEmail || '' : String(apiData[field.key] ?? ''),
        readOnly: field.readOnly || false // Mantém readOnly definido na estrutura
    }));
};

// Função para mapear dados do formulário para o payload da API (PUT)
const transformFormDataToApiData = (formDataArray, originalApiData) => {
    const apiData = { idcliente: originalApiData?.idcliente }; // Inclui o ID original para o PUT

    formDataArray.forEach(item => {
        // Não envia campos readOnly como 'email' ou 'nif'
        if (item.key && !item.readOnly) {
            // Converte de volta para número se necessário (NIF/CP/Contacto)
            if (['nifcliente', 'contactoC1', 'contactoC2'].includes(item.key)) {
                apiData[item.key] = item.value ? parseInt(item.value.replace(/\D/g,''), 10) : null;
            } else if (item.key === 'codigoPostalCp') { // Nome esperado pela API para CP é codigoPostalCp
                apiData[item.key] = item.value ? parseInt(item.value.replace(/\D/g,''), 10) : null;
            }
            else {
                apiData[item.key] = item.value;
            }
        }
    });
    // Adiciona campos que não estão no form mas são necessários para o PUT (vindos dos dados originais)
    // Ex: Garante que loginIdlogin e estadoValCc vão no PUT se a API os esperar
    if (originalApiData?.loginIdlogin) {
        apiData['loginIdlogin'] = originalApiData.loginIdlogin;
    }
    if (originalApiData?.estadoValCc !== undefined) { // Verifica se existe
        apiData['estadoValCc'] = originalApiData.estadoValCc;
    }


    return apiData;
};

// Componente Placeholder Icon (pode mover para ficheiro separado)
const PlaceholderUserIcon = () => (
    <svg className="w-full h-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const ClientProfile = () => {
    const { user, logout } = useAuth(); // 'user' agora tem id, email, roleId, roleName
    const navigate = useNavigate();
    const [originalData, setOriginalData] = useState(null); // Guarda dados originais da API
    const [formData, setFormData] = useState(() => transformApiDataToFormData(null, user?.email)); // Usa email do user se disponível inicialmente
    const [userImage, setUserImage] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState(null);

    // Buscar dados do perfil quando o componente monta ou o user muda
    useEffect(() => {
        const fetchProfileData = async () => {
            // Usa user.id (ID do Login) para buscar o cliente correspondente
            if (!user?.id) {
                setError("Utilizador não autenticado ou ID não encontrado.");
                setIsLoading(false);
                setFormData(transformApiDataToFormData(null, user?.email));
                setOriginalData(null);
                setUserImage(null);
                return;
            }
            setIsLoading(true);
            setError(null);
            try {
                // Endpoint para buscar cliente PELO ID DO LOGIN
                // A API precisa ter um endpoint como /api/clientes/by-login/{loginId}
                // OU modificar /api/clientes/me para funcionar com base no token
                // Assumindo /api/clientes/me funciona com o token:
                console.log("Fetching profile data for user:", user.id);
                const data = await fetchWithAuth(`/api/clientes/me`); // Endpoint hipotético /me

                // Se /me não existir, terias de buscar pelo ID do cliente se o tiveres
                // ou pelo ID do login: fetchWithAuth(`/api/clientes/by-login/${user.id}`)

                console.log("API Data received:", data);
                // Extrair o código postal numérico e localidade para o formulário
                const displayData = {
                    ...data,
                    codigoPostal: data.codigoPostalCp?.toString() || '', // Usa codigoPostalCp da API
                    localidade: data.codigoPostalCpNavigation?.localidade || '' // Usa localidade da navegação
                };
                setOriginalData(data); // Guarda os dados brutos da API
                setFormData(transformApiDataToFormData(displayData, user.email)); // Popula form com dados tratados + email
                setUserImage(data.imageUrl || null);

            } catch (err) {
                console.error("Erro ao buscar dados do perfil:", err);
                setError(err.message || "Não foi possível carregar os dados do perfil.");
                setFormData(transformApiDataToFormData(null, user?.email)); // Reset com email
                setOriginalData(null);
                setUserImage(null);
                if (err.status === 404) {
                    setError("Perfil de cliente não encontrado. Contacte o suporte.");
                } else if (err.status === 401 || err.status === 403) {
                    setError("Não autorizado a aceder aos dados.");
                    logout(); // Desloga se não autorizado
                    navigate('/login');
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfileData();
        // Depende do user.id para re-fetch se o user mudar (embora improvável numa sessão)
    }, [user?.id, user?.email, logout, navigate]);

    const handleChange = (index, newValue) => {
        if (isLoading || error || isUpdating || isDeleting || formData[index].readOnly) return;
        setFormData(prevData => {
            const updated = [...prevData];
            updated[index] = { ...updated[index], value: newValue };
            return updated;
        });
    };

    const handleUpdate = async () => {
        if (!originalData?.idcliente) { // Precisa do ID do *cliente* para o PUT
            alert("Erro: ID do cliente não encontrado para atualização.");
            return;
        }
        setIsUpdating(true);
        setError(null);
        // Transforma dados do form para formato da API, incluindo ID e campos não editáveis
        const dataToSend = transformFormDataToApiData(formData, originalData);
        console.log("Updating profile with data:", dataToSend);

        try {
            // Usa o ID do CLIENTE no endpoint PUT
            const updatedData = await fetchWithAuth(`/api/Clientes/${originalData.idcliente}`, {
                method: 'PUT',
                body: dataToSend // fetchWithAuth faz o stringify
            });

            // Se PUT retorna NoContent (204), os dados a mostrar são os que enviámos
            // Se retornar o objeto atualizado (200 OK), usamos esse
            let dataToDisplay = updatedData ? updatedData : dataToSend;

            // Atualiza o estado com os dados que foram enviados ou retornados
            // É crucial re-extrair CP e Localidade para o display
            const displayData = {
                ...dataToDisplay,
                codigoPostal: dataToDisplay.codigoPostalCp?.toString() || '',
                // Se a API não retornou a navegação no PUT, tenta reusar a localidade original se CP não mudou
                localidade: dataToDisplay.codigoPostalCpNavigation?.localidade || (dataToDisplay.codigoPostalCp === originalData.codigoPostalCp ? originalData.codigoPostalCpNavigation?.localidade : '') || ''
            };

            setOriginalData(dataToDisplay); // Atualiza dados originais
            setFormData(transformApiDataToFormData(displayData, user.email));
            setUserImage(displayData.imageUrl || null);
            alert("Dados atualizados com sucesso!");

        } catch (err) {
            console.error("Erro ao atualizar dados:", err);
            setError(err.message || "Não foi possível atualizar os dados.");
            alert(`Erro: ${err.message || "Não foi possível atualizar os dados."}`);
            // Opcional: Reverter formData para originalData em caso de erro?
            // setFormData(transformApiDataToFormData(originalData, user.email));
        } finally {
            setIsUpdating(false);
        }
    };


    const handleDelete = async () => {
        if (!originalData?.idcliente) {
            alert("Erro: ID do cliente não encontrado para eliminação.");
            return;
        }
        if (!window.confirm("Tem a certeza que deseja eliminar a sua conta? Esta ação é irreversível e apagará também o seu login.")) {
            return;
        }
        setIsDeleting(true);
        setError(null);
        try {
            // Idealmente, o backend deveria apagar o Cliente E o Login associado
            // A chamada aqui apaga apenas o cliente
            await fetchWithAuth(`/api/Clientes/${originalData.idcliente}`, {
                method: 'DELETE',
            });
            alert("Conta eliminada com sucesso.");
            logout(); // Desloga o utilizador
            navigate('/'); // Redireciona para a página inicial/login

        } catch (err) {
            console.error("Erro ao eliminar conta:", err);
            setError(err.message || "Não foi possível eliminar a conta.");
            alert(`Erro: ${err.message || "Não foi possível eliminar a conta."}`);
        } finally {
            setIsDeleting(false);
        }
    };

    // Nome do utilizador para display
    const userName = formData.find(item => item.key === 'nomeCliente')?.value || (isLoading ? "A carregar..." : (error ? "Erro" : "Utilizador"));
    const disableFields = isLoading || isUpdating || isDeleting || !!error; // Desativa campos se houver erro também
    const disableActions = isLoading || isUpdating || isDeleting; // Desativa ações apenas durante operações


    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            {/* Passa a imagem ou null para o header */}
            <ClientHeader userImage={userImage} />

            <main className="max-w-7xl mx-auto p-6">
                <h2 className="text-gray-400 text-sm mb-4">Informação do Perfil</h2>

                <div className="bg-white rounded-xl shadow p-6 md:p-10 grid md:grid-cols-3 gap-8 min-h-[400px]">
                    {/* Painel Esquerdo */}
                    <div className={`col-span-1 flex flex-col justify-center items-center text-center gap-4 pr-10 border-r border-gray-200`}>
                        <div className="rounded-full w-40 h-40 object-cover border overflow-hidden bg-gray-100 flex items-center justify-center">
                            {userImage ? (
                                <img src={userImage} alt="Foto do utilizador" className="w-full h-full" />
                            ) : (
                                <PlaceholderUserIcon />
                            )}
                        </div>
                        <div>
                            <p className="text-lg font-semibold">Olá,</p>
                            <p className={`text-xl font-bold ${error && !isLoading ? 'text-red-500' : ''}`}>{userName}</p>
                        </div>
                    </div>

                    {/* Painel Direito */}
                    <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Mensagem de Loading ou Erro */}
                        {isLoading && <div className="col-span-full text-center text-gray-500 py-4">A carregar dados...</div>}
                        {error && !isLoading && (
                            <div className="col-span-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                                <strong className="font-bold">Erro: </strong>
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )}

                        {/* Campos do Formulário */}
                        {!isLoading && !error && formData.map((item, i) => (
                            // Renderiza campos mesmo com erro, mas desativados
                            <div key={item.key || i}>
                                <label className="text-sm font-medium text-gray-700">
                                    {item.label} {item.readOnly && '(não editável)'}
                                </label>
                                <InputFieldLong
                                    type={item.type || "text"}
                                    placeholder={item.label}
                                    value={item.value}
                                    onChange={(e) => handleChange(i, e.target.value)}
                                    // Desativado se loading, erro, operação em curso OU se for readOnly
                                    disabled={disableFields || item.readOnly}
                                    className={(disableFields || item.readOnly) ? 'bg-gray-100 cursor-not-allowed' : ''}
                                    readOnly={item.readOnly} // Prop readOnly para inputs que não devem ser alterados
                                />
                            </div>
                        ))}

                        {/* Botões de Ação */}
                        {!isLoading && !error && ( // Mostra botões apenas se não houver erro inicial de carregamento
                            <div className="flex gap-4 mt-4 col-span-full justify-end">
                                <Button
                                    text={isDeleting ? "A eliminar..." : "Eliminar Conta"}
                                    variant="danger"
                                    onClick={handleDelete}
                                    className="!py-1"
                                    disabled={disableActions} // Desativado apenas durante operações
                                />
                                <Button
                                    text={isUpdating ? "A atualizar..." : "Atualizar Informação"}
                                    variant="primary"
                                    onClick={handleUpdate}
                                    className="!py-1"
                                    disabled={disableActions} // Desativado apenas durante operações
                                />
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ClientProfile;