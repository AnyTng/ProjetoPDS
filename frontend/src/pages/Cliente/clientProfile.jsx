import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../hooks/useAuth";
import ClientHeader from "../../components/clientHeader.jsx";
import ClientSidebarPanel from "../../components/clientSideBarPanel.jsx";
import InputFieldLong from "../../components/inputFieldLong.jsx";
import Button from "../../components/button.jsx";

// Estrutura inicial do formulário com campos vazios
const initialFormStructure = [
    { key: 'nome', label: "Nome", value: "" },
    { key: 'email', label: "Email", value: "" },
    { key: 'telefone', label: "Telefone", value: "" },
    { key: 'morada', label: "Morada", value: "" },
    { key: 'codPostal', label: "Código Postal", value: "" },
    // Adicionar mais campos aqui se necessário
    // { key: 'nif', label: "NIF", value: "" },
];

// Função para transformar dados da API para o formato do formulário
const transformApiDataToFormData = (apiData) => {
    if (!apiData) return initialFormStructure; // Retorna estrutura vazia se não houver dados

    // Mapeia a estrutura inicial, preenchendo com dados da API
    return initialFormStructure.map(field => ({
        ...field,
        value: apiData[field.key] || "" // Preenche com valor da API ou mantém vazio
    }));
};

// Função para transformar dados do formulário para o formato da API
const transformFormDataToApiData = (formDataArray) => {
    const apiData = {};
    formDataArray.forEach(item => {
        if (item.key) {
            apiData[item.key] = item.value;
        }
    });
    return apiData;
};

// --- SVG Placeholder ---
const PlaceholderUserIcon = () => (
    <svg className="w-full h-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);
// --- Fim SVG Placeholder ---

const ClientProfile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState(initialFormStructure); // Inicia com estrutura vazia
    const [userImage, setUserImage] = useState(null); // Estado para URL da imagem
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState(null);

    // Fetch User Data Effect
    useEffect(() => {
        const fetchProfileData = async () => {
            if (!user?.token) {
                setError("Utilizador não autenticado.");
                setIsLoading(false);
                setFormData(initialFormStructure); // Garante estrutura vazia
                setUserImage(null);
                return;
            }
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/clients/me`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) {
                    throw new Error(`Erro ao buscar perfil: ${response.statusText}`);
                }
                const data = await response.json();
                setFormData(transformApiDataToFormData(data)); // Preenche a estrutura
                setUserImage(data.imageUrl || null); // Define imagem ou null

            } catch (err) {
                console.error("Erro ao buscar dados do perfil:", err);
                setError(err.message || "Não foi possível carregar os dados do perfil.");
                setFormData(initialFormStructure); // Mantém estrutura vazia no erro
                setUserImage(null); // Garante que não há imagem no erro
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfileData();
    }, [user]);

    const handleChange = (index, newValue) => {
        // Só permite alterar se não estiver loading/error/updating/deleting
        if (isLoading || error || isUpdating || isDeleting) return;
        setFormData(prevData => {
            const updated = [...prevData];
            updated[index] = { ...updated[index], value: newValue };
            return updated;
        });
    };

    const handleUpdate = async () => {
        // ... (lógica de update igual à anterior) ...
        if (!user?.token) {
            alert("Erro: Autenticação necessária.");
            return;
        }
        setIsUpdating(true);
        setError(null);
        const dataToSend = transformFormDataToApiData(formData);
        try {
            const response = await fetch(`/api/clients/me`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataToSend)
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Falha ao atualizar: ${response.statusText} ${errorData.message || ''}`);
            }
            const updatedData = await response.json();
            setFormData(transformApiDataToFormData(updatedData));
            setUserImage(updatedData.imageUrl || null); // Atualiza imagem se mudar
            alert("Dados atualizados com sucesso!");
        } catch (err) {
            console.error("Erro ao atualizar dados:", err);
            setError(err.message || "Não foi possível atualizar os dados.");
            alert(`Erro: ${err.message || "Não foi possível atualizar os dados."}`);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        // ... (lógica de delete igual à anterior) ...
        if (!user?.token) {
            alert("Erro: Autenticação necessária.");
            return;
        }
        if (!window.confirm("Tem a certeza que deseja eliminar a sua conta? Esta ação é irreversível.")) {
            return;
        }
        setIsDeleting(true);
        setError(null);
        try {
            const response = await fetch(`/api/clients/me`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (!response.ok) {
                throw new Error(`Falha ao eliminar conta: ${response.statusText}`);
            }
            alert("Conta eliminada com sucesso.");
            logout();
            navigate('/');
        } catch (err) {
            console.error("Erro ao eliminar conta:", err);
            setError(err.message || "Não foi possível eliminar a conta.");
            alert(`Erro: ${err.message || "Não foi possível eliminar a conta."}`);
        } finally {
            setIsDeleting(false);
        }
    };

    // Obtém o nome do utilizador do estado `formData`
    const userName = formData.find(item => item.key === 'nome')?.value || (error ? "Erro ao carregar" : "Utilizador");
    const disableFields = isLoading || !!error || isUpdating || isDeleting;
    const disableActions = isLoading || isUpdating || isDeleting; // Ações desativadas apenas durante operações, não em erro estático

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            {/* Passa a imagem ou null para o header decidir o que mostrar */}
            <ClientHeader userImage={userImage} />

            <main className="max-w-7xl mx-auto p-6">
                <h2 className="text-gray-400 text-sm mb-4">Informação do Perfil</h2>

                <div className="bg-white rounded-xl shadow p-6 md:p-10 grid md:grid-cols-3 gap-8 min-h-[400px]">
                    {/* Painel Esquerdo Reutilizável */}
                    {/* Modificado para mostrar placeholder diretamente aqui */}
                    <div className={`col-span-1 flex flex-col justify-center items-center text-center gap-4 pr-10 border-r border-gray-200`}>
                        <div className="rounded-full w-40 h-40 object-cover border overflow-hidden bg-gray-100">
                            {userImage ? (
                                <img src={userImage} alt="Foto do utilizador" className="w-full h-full" />
                            ) : (
                                <PlaceholderUserIcon />
                            )}
                        </div>
                        <div>
                            <p className="text-lg font-semibold">Olá,</p>
                            {/* Mostra o nome ou estado de erro */}
                            <p className={`text-xl font-bold ${error && !isLoading ? 'text-red-500' : ''}`}>{userName}</p>
                        </div>
                    </div>

                    {/* Painel Direito */}
                    <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Mensagem de Loading ou Erro */}
                        {isLoading && <div className="col-span-full text-center text-gray-500 py-4">A carregar dados...</div>}
                        {error && !isLoading && (
                            <div className="col-span-full text-sm text-red-600 mb-4">
                                Erro: {error}. Não é possível editar os dados.
                            </div>
                        )}

                        {/* Campos do Formulário */}
                        {formData.map((item, i) => (
                            <div key={item.key || i}>
                                <label className="text-sm font-medium text-gray-700">
                                    {item.label}
                                </label>
                                <InputFieldLong
                                    type="text"
                                    placeholder={item.label}
                                    value={item.value} // Sempre reflete o estado atual (vazio no erro/loading)
                                    onChange={(e) => handleChange(i, e.target.value)}
                                    disabled={disableFields} // Desativado se loading, erro ou operação em curso
                                    // Adiciona estilo visual para campos desativados devido a erro/loading
                                    className={isLoading || !!error ? 'bg-gray-100 cursor-not-allowed' : ''}
                                />
                            </div>
                        ))}

                        {/* Botões de Ação */}
                        <div className="flex gap-4 mt-4 col-span-full justify-end">
                            <Button
                                text={isDeleting ? "A eliminar..." : "Eliminar Conta"}
                                variant="danger"
                                onClick={handleDelete}
                                className="!py-1"
                                disabled={disableActions || !!error} // Desativado durante operações ou se houve erro inicial
                            />
                            <Button
                                text={isUpdating ? "A atualizar..." : "Atualizar Informação"}
                                variant="primary"
                                onClick={handleUpdate}
                                className="!py-1"
                                disabled={disableActions || !!error} // Desativado durante operações ou se houve erro inicial
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ClientProfile;