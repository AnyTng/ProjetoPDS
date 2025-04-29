import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../hooks/useAuth";
import { fetchWithAuth } from "../../utils/api"; // Ensure this utility handles errors and JSON correctly
import ClientHeader from "../../components/clientHeader.jsx";
import Footer from "../../components/footer.jsx";
import InputFieldLong from "../../components/inputFieldLong.jsx";
import Button from "../../components/button.jsx";

// Define the structure of the form fields and their initial state
const initialFormStructure = [
    { key: 'nomeCliente', label: "Nome", value: "", type: "text" },
    { key: 'email', label: "Email", value: "", type: "email", readOnly: true },
    { key: 'dataNascCliente', label: "Data Nascimento", value: "", type: "date" },
    { key: 'contactoC1', label: "Telefone", value: "", type: "tel" },
    { key: 'contactoC2', label: "Telefone 2 (Opcional)", value: "", type: "tel" },
    { key: 'ruaCliente', label: "Morada", value: "", type: "text" },
    { key: 'codigoPostal', label: "Código Postal", value: "", type: "text" },
    { key: 'localidade', label: "Localidade", value: "", type: "text", readOnly: true },
    { key: 'nifCliente', label: "NIF", value: "", type: "text", readOnly: true },
    { key: 'estadoValCc', label: "Estado da Carta de Condução", value: "", type: "text", readOnly: true },
];

// Maps data received from the API (GET /api/clientes/me) to the 'formData' state structure
// (Keep this function as it's needed for displaying fetched data)
const transformApiDataToFormData = (apiData) => {
    if (!apiData) return initialFormStructure.map(f => ({ ...f, value: '' }));
    console.log("Mapping API data to form:", apiData);
    return initialFormStructure.map(field => {
        let finalValue = '';
        if (field.key === 'dataNascCliente' && apiData[field.key]) {
            try {
                const dateStringFromApi = apiData[field.key];
                finalValue = dateStringFromApi.substring(0, 10);
                if (!/^\d{4}-\d{2}-\d{2}$/.test(finalValue)) {
                    console.error(`Invalid date substring extracted for ${field.key}:`, finalValue, "from API string:", dateStringFromApi);
                    finalValue = '';
                }
            } catch (e) {
                console.error(`Error processing date string for ${field.key}:`, apiData[field.key], e);
                finalValue = '';
            }
        } else {
            const apiValue = apiData[field.key];
            finalValue = String(apiValue ?? '');
        }
        return { ...field, value: finalValue, readOnly: field.readOnly || false };
    });
};


// Placeholder for user image
const PlaceholderUserIcon = () => ( <svg className="w-full h-full text-gray-300" fill="currentColor" viewBox="0 0 24 24"> <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /> </svg> );

// Main component for the client profile page
const ClientePerfil = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [originalData, setOriginalData] = useState(null);
    const [formData, setFormData] = useState(() => initialFormStructure.map(f => ({ ...f })));
    const [userImage, setUserImage] = useState(null); // Stores user profile image (Data URL format)
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState(null);

    // Effect Hook to fetch profile data
    useEffect(() => {
        const fetchProfileData = async () => {
            if (!user?.id) {
                setError("Utilizador não autenticado ou ID não encontrado.");
                setIsLoading(false);
                setFormData(prev => prev.map(f => f.key === 'email' ? { ...f, value: user?.email || '' } : f));
                return;
            }
            setIsLoading(true);
            setError(null);
            try {
                console.log("Fetching profile data for user login ID:", user.id);
                const data = await fetchWithAuth(`/api/clientes/me`);
                console.log("API Data received:", data);
                if (!data) throw new Error("API não retornou dados do perfil.");
                const dataWithEmail = { ...data, email: data.email || user?.email };
                setOriginalData(data);
                setFormData(transformApiDataToFormData(dataWithEmail));
                setUserImage(data.imagemBase64 || null);
            } catch (err) {
                console.error("Erro ao buscar dados do perfil:", err);
                setError(err.message || "Erro ao carregar o perfil.");
                setFormData(initialFormStructure.map(f => ({ ...f, value: f.key === 'email' ? user?.email || '' : '' })));
                setOriginalData(null);
                setUserImage(null);
                if (err.status === 401 || err.status === 403) {
                    alert("Sessão expirada ou não autorizado. Por favor, faça login novamente.");
                    logout();
                    navigate('/login');
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfileData();
    }, [user?.id, user?.email, logout, navigate]);

    // Handles changes in any form input field
    const handleChange = (index, newValue) => {
        if (isLoading || isUpdating || isDeleting || !!error || !formData[index] || formData[index].readOnly) {
            console.warn("Change prevented.");
            return;
        }
        setFormData(prevData => {
            const updated = [...prevData];
            if (updated[index]) {
                updated[index] = { ...updated[index], value: newValue };
            } else {
                console.error(`handleChange error: Could not find item at index ${index} to update.`);
                return prevData;
            }
            return updated;
        });
    };

    // Handles the submission of the updated profile data (FINAL VERSION)
    const handleUpdate = async () => {
        // --- Frontend Validation (Keep this as is) ---
        const nomeField = formData.find(f => f.key === 'nomeCliente');
        const contacto1Field = formData.find(f => f.key === 'contactoC1');
        const cpField = formData.find(f => f.key === 'codigoPostal');
        const ruaField = formData.find(f => f.key === 'ruaCliente');
        const localidadeField = formData.find(f => f.key === 'localidade');

        if (!nomeField?.value?.trim()) { alert("O campo 'Nome' é obrigatório."); return; }
        if (!ruaField?.value?.trim()) { alert("O campo 'Morada' (Rua) é obrigatório."); return; }
        if (!cpField?.value?.trim()) { alert("O campo 'Código Postal' é obrigatório."); return; }
        if (!localidadeField?.value?.trim()) { alert("O campo 'Localidade' é obrigatório."); return; }
        if (!contacto1Field?.value?.trim()) { alert("O campo 'Telefone' é obrigatório."); return; }
        if (contacto1Field?.value && !/^\d{9}$/.test(contacto1Field.value.replace(/\D/g,''))) { alert("Formato inválido para 'Telefone'. Deve conter 9 dígitos."); return; }
        const contacto2Field = formData.find(f => f.key === 'contactoC2');
        if (contacto2Field?.value && !/^\d{9}$/.test(contacto2Field.value.replace(/\D/g,''))) { alert("Formato inválido para 'Telefone 2'. Deve conter 9 dígitos (se preenchido)."); return; }
        if (!validateCodigoPostal(cpField?.value)) { alert("Formato inválido para Código Postal (Ex: 1234-567 ou 1234567)."); return; }
        // --- END FRONTEND VALIDATION ---

        setIsUpdating(true);
        setError(null);

        // --- Construct FormData Payload ---
        const dataToSend = new FormData();
        formData.forEach(item => {
            switch (item.key) {
                case 'nomeCliente': dataToSend.append('NomeCliente', item.value || ''); break;
                case 'dataNascCliente': dataToSend.append('DataNascCliente', item.value || ''); break;
                case 'ruaCliente': dataToSend.append('RuaCliente', item.value || ''); break;
                case 'codigoPostal': dataToSend.append('CodigoPostal', item.value || ''); break;
                case 'localidade': dataToSend.append('Localidade', item.value || ''); break;
                case 'contactoC1': dataToSend.append('ContactoC1', item.value ? item.value.replace(/\D/g, '') : ''); break;
                case 'contactoC2': dataToSend.append('ContactoC2', item.value ? item.value.replace(/\D/g, '') : ''); break;
                case 'email': case 'nifCliente': case 'estadoValCc': break; // Skip read-only
                default: break;
            }
        });
        const imageInput = document.getElementById('profileImageInput');
        const imageFile = imageInput?.files?.[0];
        if (imageFile) {
            dataToSend.append('ImagemCliente', imageFile, imageFile.name);
            console.log("Appending image file to FormData with key 'ImagemCliente'");
        } else {
            console.log("No new image file selected.");
        }
        // --- End Construct FormData Payload ---

        console.log("FormData content (keys):");
        for (let key of dataToSend.keys()) { console.log(` - ${key}`); }

        try {
            const url = `/api/clientes/me`; // Endpoint without query params
            console.log("Attempting API call to URL:", url);
            console.log("Sending FormData object as body.");

            await fetchWithAuth(url, { method: 'PUT', body: dataToSend, });
            console.log("API call successful.");

            const refreshedData = await fetchWithAuth(`/api/clientes/me`);
            if (refreshedData) {
                const dataWithEmail = { ...refreshedData, email: refreshedData.email || user?.email };
                setOriginalData(refreshedData);
                setFormData(transformApiDataToFormData(dataWithEmail));
                setUserImage(refreshedData.imagemBase64 || null);
                if (imageInput) imageInput.value = ""; // Clear file input
            } else {
                console.warn("Não foi possível re-buscar os dados após atualização.");
            }
            alert("Dados atualizados com sucesso!");

        } catch (err) {
            console.error("Erro ao atualizar dados:", err);
            console.error("Detailed error object from API call:", JSON.stringify(err, null, 2));
            let errorMsg = "Não foi possível atualizar os dados.";
            if (err && err.data) {
                if (err.data.errors && typeof err.data.errors === 'object') {
                    const validationErrors = Object.entries(err.data.errors).map(([field, messages]) => `  - ${field}: ${messages.join(', ')}`).join('\n');
                    if (validationErrors) { errorMsg = `Erros de validação:\n${validationErrors}`; }
                    else if (err.data.title) { errorMsg = err.data.title; }
                } else if (err.data.title) { errorMsg = err.data.title;
                } else if (err.data.detail) { errorMsg = err.data.detail;
                } else if (err.message) { errorMsg = err.message; }
            } else if (err instanceof Error && err.message) { errorMsg = err.message; }
            setError(errorMsg);
            alert(`Erro ao atualizar:\n${errorMsg}`);
        } finally {
            setIsUpdating(false);
        }
    };

    // Handle image upload
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { alert("A imagem é muito grande. O tamanho máximo é 5MB."); return; }
        if (!file.type.match('image.*')) { alert("Por favor, selecione uma imagem válida."); return; }
        const reader = new FileReader();
        reader.onload = (e) => { setUserImage(e.target.result); };
        reader.onerror = (error) => { console.error("Error reading file:", error); alert("Erro ao ler o ficheiro da imagem."); };
        reader.readAsDataURL(file);
    };

    // Handles account deletion
    const handleDelete = async () => {
        if (!originalData?.idcliente) { alert("Erro: ID do cliente não encontrado. Não é possível eliminar."); return; }
        if (!window.confirm("Tem a certeza absoluta que deseja eliminar a sua conta? Esta ação é irreversível e todos os seus dados associados serão perdidos.")) { return; }
        setIsDeleting(true);
        setError(null);
        try {
            await fetchWithAuth(`/api/Clientes/${originalData.idcliente}`, { method: 'DELETE' });
            alert("A sua conta foi eliminada com sucesso.");
            logout();
            navigate('/');
        } catch (err) {
            console.error("Erro ao eliminar conta:", err);
            const errorMsg = err.message || "Ocorreu um erro ao tentar eliminar a conta.";
            setError(errorMsg);
            alert(`Erro ao eliminar: ${errorMsg}`);
        } finally {
            setIsDeleting(false);
        }
    };

    // Helper variables
    const userName = formData.find(item => item.key === 'nomeCliente')?.value || (isLoading ? "A carregar..." : (error ? "Erro" : "Utilizador"));
    const disableFields = isLoading || isUpdating || isDeleting || !!error;
    const disableActions = isLoading || isUpdating || isDeleting;

    // ---- JSX Rendering ----
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
            <ClientHeader userImage={userImage} />
            <main className="max-w-7xl mx-auto p-6 flex-grow">
                <h2 className="text-gray-400 text-sm mb-4">Informação do Perfil</h2>
                <div className="bg-white rounded-xl shadow p-6 md:p-10 grid md:grid-cols-3 gap-8 min-h-[400px]">

                    {/* Left Panel */}
                    <div className={`col-span-1 flex flex-col justify-center items-center text-center gap-4 pr-10 border-r border-gray-200`}>
                        <div className="relative">
                            <div className="rounded-full w-40 h-40 object-cover border overflow-hidden bg-gray-100 flex items-center justify-center">
                                {userImage ? (<img src={userImage} alt="Foto do utilizador" className="w-full h-full object-cover" />) : (<PlaceholderUserIcon />)}
                            </div>
                            <input type="file" id="profileImageInput" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={disableFields} />
                            <button onClick={() => document.getElementById('profileImageInput').click()} className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors" disabled={disableFields} title="Alterar foto de perfil">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                            </button>
                        </div>
                        <div>
                            <p className="text-lg font-semibold">Olá,</p>
                            <p className={`text-xl font-bold ${error && !isLoading ? 'text-red-500' : ''}`}>{userName}</p>
                        </div>
                    </div>

                    {/* Right Panel: Form */}
                    <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[600px] pr-2">
                        {isLoading && <div className="col-span-full text-center text-gray-500 py-10">A carregar dados do perfil...</div>}
                        {error && !isLoading && (
                            <div className="col-span-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative whitespace-pre-wrap" role="alert">
                                <strong className="font-bold">Erro ao carregar/atualizar perfil: </strong>
                                <span className="block sm:inline">{error}</span>
                                <button onClick={() => window.location.reload()} className="ml-4 text-sm underline">Tentar Recarregar</button>
                            </div>
                        )}
                        {!isLoading && formData.length > 0 && formData.map((item, i) => {
                            if (item.key === 'estadoValCc') {
                                const isValidated = item.value === "true";
                                return (
                                    <div key={item.key || i}>
                                        <label htmlFor={item.key} className="block text-sm font-medium text-gray-700 mb-1">{item.label}{item.readOnly && <span className="text-xs text-gray-500"> (não editável)</span>}</label>
                                        <div className={`p-2.5 rounded-md ${isValidated ? 'bg-green-100' : 'bg-red-100'} relative group`} title={!isValidated ? "Deverá dirigir-se à nossa loja para re-validar a carta de condução" : ""}>
                                            <span className="font-light">{isValidated ? "Confirmada" : "Ação necessária"}</span>
                                            {!isValidated && (<div className="hidden group-hover:block absolute left-0 top-full mt-2 p-2 bg-gray-800 text-white text-sm rounded-md z-10 w-64">Deverá dirigir-se à nossa loja para re-validar a carta de condução</div>)}
                                        </div>
                                    </div>
                                );
                            }
                            return (
                                <div key={item.key || i}>
                                    <label htmlFor={item.key} className="block text-sm font-medium text-gray-700 mb-1">{item.label}{item.readOnly && <span className="text-xs text-gray-500"> (não editável)</span>}</label>
                                    <InputFieldLong
                                        id={item.key} name={item.key} type={item.type || "text"} placeholder={item.label} value={item.value} onChange={(e) => handleChange(i, e.target.value)} disabled={disableFields || item.readOnly} className={`${(disableFields || item.readOnly) ? 'bg-gray-100 cursor-not-allowed opacity-70' : ''}`} readOnly={item.readOnly}
                                        pattern={item.key === 'contactoC1' || item.key === 'contactoC2' ? "[0-9]{9}" : undefined}
                                        title={item.key === 'contactoC1' || item.key === 'contactoC2' ? "Deve conter 9 dígitos" : undefined}
                                    />
                                </div>
                            );
                        })}
                        {!isLoading && originalData && (
                            <div className="flex gap-4 mt-4 col-span-full justify-end">
                                <Button text={isDeleting ? "A eliminar..." : "Eliminar Conta"} variant="danger" onClick={handleDelete} className="!py-1" disabled={disableActions} />
                                <Button text={isUpdating ? "A atualizar..." : "Atualizar Informação"} variant="primary" onClick={handleUpdate} className="!py-1" disabled={disableActions} />
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

// Helper function for CP validation
const validateCodigoPostal = (cp) => {
    if (!cp) return false;
    const cpDigits = cp.replace(/\D/g, '');
    return /^\d{7}$/.test(cpDigits);
};

export default ClientePerfil;