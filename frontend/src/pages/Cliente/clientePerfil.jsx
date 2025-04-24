// srcFrontend/pages/Cliente/clientePerfil.jsx
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../hooks/useAuth";
import { fetchWithAuth } from "../../utils/api"; // Ensure this utility handles errors and JSON correctly
import ClientHeader from "../../components/clientHeader.jsx";
import Footer from "../../components/footer.jsx";
import InputFieldLong from "../../components/inputFieldLong.jsx";
import Button from "../../components/button.jsx";

// Define the structure of the form fields and their initial state
// Keys should match the expected fields from the API (GET /me) and DTO (PUT /me)
const initialFormStructure = [
    { key: 'nomeCliente', label: "Nome", value: "", type: "text" },
    { key: 'email', label: "Email", value: "", type: "email", readOnly: true }, // Email usually non-editable
    { key: 'dataNascCliente', label: "Data Nascimento", value: "", type: "date" },
    { key: 'contactoC1', label: "Telefone", value: "", type: "tel" }, // Use tel type for potential mobile keyboards
    { key: 'contactoC2', label: "Telefone 2 (Opcional)", value: "", type: "tel" },
    { key: 'ruaCliente', label: "Morada", value: "", type: "text" },
    { key: 'codigoPostal', label: "Código Postal", value: "", type: "text" }, // String format (backend handles lookup)
    { key: 'localidade', label: "Localidade", value: "", type: "text", readOnly: true }, // Often read-only, derived from CP
    { key: 'nifCliente', label: "NIF", value: "", type: "text", readOnly: true }, // NIF usually non-editable
    { key: 'estadoValCc', label: "Estado da Carta de Condução", value: "", type: "text", readOnly: true }, // Read-only field for validation status
];

// Maps data received from the API (GET /api/clientes/me) to the 'formData' state structure
const transformApiDataToFormData = (apiData) => {
    // If no API data, return the initial structure with empty values
    if (!apiData) return initialFormStructure.map(f => ({ ...f, value: '' }));

    console.log("Mapping API data to form:", apiData);

    // Iterate over the defined form structure
    return initialFormStructure.map(field => {
        let finalValue = '';
        if (field.key === 'dataNascCliente' && apiData[field.key]) {
            try {
                // Assume que a API envia algo como "1990-05-15T00:00:00" ou "1990-05-15T00:00:00Z" ou só "1990-05-15"
                const dateStringFromApi = apiData[field.key];
                // Pega apenas os primeiros 10 caracteres (YYYY-MM-DD)
                finalValue = dateStringFromApi.substring(0, 10);

                // Validação básica do formato extraído
                if (!/^\d{4}-\d{2}-\d{2}$/.test(finalValue)) {
                    console.error(`Invalid date substring extracted for ${field.key}:`, finalValue, "from API string:", dateStringFromApi);
                    finalValue = ''; // Reset se o formato não for YYYY-MM-DD
                }

            } catch (e) {
                console.error(`Error processing date string for ${field.key}:`, apiData[field.key], e);
                finalValue = '';
            }
        }

        // Handle Date formatting specifically
        if (field.key === 'dataNascCliente' && apiData[field.key]) {
            try {
                // Format date to YYYY-MM-DD for the input type="date"
                finalValue = new Date(apiData[field.key]).toISOString().split('T')[0];
            } catch (e) {
                console.error(`Error formatting date for ${field.key}:`, apiData[field.key], e);
                finalValue = ''; // Fallback to empty string on error
            }
        }
        // For all other fields, get the value from apiData using the field's key
        else {
            const apiValue = apiData[field.key];
            // Convert null/undefined to empty string for display consistency
            finalValue = String(apiValue ?? '');
        }

        // Ensure readOnly status is preserved from the initial structure
        return {
            ...field,
            value: finalValue,
            readOnly: field.readOnly || false
        };
    });
};

// Maps data from the current form state ('formData') back to the format expected by the PUT /api/clientes/me endpoint
// It uses the DTO structure (ClienteUpdateDto) defined in the backend controller
const transformFormDataToApiData = (formDataArray) => {
    const apiPayload = {}; // Start with an empty object for the payload

    formDataArray.forEach(item => {
        // Include only fields that are NOT readOnly and have a key relevant for the update DTO
        if (item.key && !item.readOnly && item.key !== 'email' && item.key !== 'localidade' && item.key !== 'nifCliente' && item.key !== 'estadovalcc') {
            // Handle specific type conversions required by the backend DTO
            if (['contactoC1', 'contactoC2'].includes(item.key)) {
                // Convert phone numbers to integers or null if empty
                const numericValue = item.value ? parseInt(item.value.replace(/\D/g, ''), 10) : null;
                if (!isNaN(numericValue) || numericValue === null) {
                    apiPayload[item.key] = numericValue;
                } else {
                    // Handle potential parsing errors if needed, maybe default to null or log warning
                    console.warn(`Could not parse numeric value for ${item.key}: ${item.value}`);
                    apiPayload[item.key] = null; // Or handle as needed
                }
            } else if (item.key === 'dataNascCliente') {
                // Send date as string YYYY-MM-DD, or null if empty
                apiPayload[item.key] = item.value || null;
            } else if (item.key === 'codigoPostal') {
                // Send CP as string, backend will handle validation/lookup
                apiPayload[item.key] = item.value;
                // NOTE: The backend PUT /me also expects 'Localidade' if creating a new CP.
                // We need to find the corresponding locality value from the *original* or *current* form data
                // if we intend the backend to create a CP. Let's assume CP edit *only* updates the FK for now.
                // If CP creation on PUT is needed, send locality too:
                const localityField = formDataArray.find(f => f.key === 'localidade');
                apiPayload['localidade'] = localityField ? localityField.value : ''; // Send locality if needed

            } else {
                // For standard string fields (nomeCliente, ruaCliente)
                apiPayload[item.key] = item.value;
            }
        }
    });

    console.log("--- Payload for PUT /me API ---", apiPayload);
    return apiPayload; // This object should match the backend's ClienteUpdateDto
};


// Placeholder for user image
const PlaceholderUserIcon = () => ( <svg className="w-full h-full text-gray-300" fill="currentColor" viewBox="0 0 24 24"> <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /> </svg> );

// Main component for the client profile page
const ClientePerfil = () => {
    const { user, logout } = useAuth(); // Get user context and logout function
    const navigate = useNavigate();
    const [originalData, setOriginalData] = useState(null); // Stores raw data from GET /me
    const [formData, setFormData] = useState(() => initialFormStructure.map(f => ({ ...f }))); // Form fields state, ensure deep copy
    const [userImage, setUserImage] = useState(null); // Stores user profile image URL
    const [isLoading, setIsLoading] = useState(true); // Loading state for initial data fetch
    const [isUpdating, setIsUpdating] = useState(false); // Loading state for update operation
    const [isDeleting, setIsDeleting] = useState(false); // Loading state for delete operation
    const [error, setError] = useState(null); // Stores error messages

    // Effect Hook to fetch profile data when the component mounts or user context changes
    useEffect(() => {
        const fetchProfileData = async () => {
            // Ensure user and user ID are available from context
            if (!user?.id) {
                setError("Utilizador não autenticado ou ID não encontrado.");
                setIsLoading(false);
                // Optionally pre-fill email if available
                setFormData(prev => prev.map(f => f.key === 'email' ? { ...f, value: user?.email || '' } : f));
                return;
            }

            setIsLoading(true);
            setError(null); // Clear previous errors

            try {
                console.log("Fetching profile data for user login ID:", user.id);
                // Fetch data using the authenticated utility function
                const data = await fetchWithAuth(`/api/clientes/me`); // GET request to /me
                console.log("API Data received:", data);

                if (!data) {
                    throw new Error("API não retornou dados do perfil.");
                }

                // Combine fetched data with email from context (as fallback or primary source)
                const dataWithEmail = { ...data, email: data.email || user?.email };

                setOriginalData(data); // Store the original unmodified data
                setFormData(transformApiDataToFormData(dataWithEmail)); // Map data to form state
                // Assuming imageUrl might come from API, e.g., data.caminhoFotoCliente
                // setUserImage(data.imageUrl || data.caminhoFotoCliente || null);

            } catch (err) {
                console.error("Erro ao buscar dados do perfil:", err);
                setError(err.message || "Erro ao carregar o perfil.");
                setFormData(initialFormStructure.map(f => ({ ...f, value: f.key === 'email' ? user?.email || '' : '' }))); // Reset form but keep email
                setOriginalData(null);
                setUserImage(null);

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

        fetchProfileData();
    }, [user?.id, user?.email, logout, navigate]); // Dependencies ensure effect runs when these change

    // Handles changes in any form input field
    const handleChange = (index, newValue) => {
        // Prevent updates during API calls, if there's an error, or if the field is read-only
        if (isLoading || isUpdating || isDeleting || !!error || !formData[index] || formData[index].readOnly) {
            console.warn("Change prevented. State:", { isLoading, isUpdating, isDeleting, error: !!error, field: formData[index] });
            return;
        }

        // Update the state immutably
        setFormData(prevData => {
            // Create a shallow copy of the array
            const updated = [...prevData];
            // Ensure the item at the index exists
            if (updated[index]) {
                // Create a shallow copy of the object at the index and update its value
                updated[index] = { ...updated[index], value: newValue };
            } else {
                console.error(`handleChange error: Could not find item at index ${index} to update.`);
                return prevData; // Return previous state if index is somehow invalid
            }
            return updated; // Return the new array state
        });
    };


    // Handles the submission of the updated profile data
    const handleUpdate = async () => {
        // Perform frontend validation before sending to API
        const nomeField = formData.find(f => f.key === 'nomeCliente');
        const contacto1Field = formData.find(f => f.key === 'contactoC1');
        const cpField = formData.find(f => f.key === 'codigoPostal');

        if (!nomeField?.value?.trim()) { alert("O campo 'Nome' é obrigatório."); return; }
        if (!contacto1Field?.value?.trim()) { alert("O campo 'Telefone' é obrigatório."); return; }
        if (contacto1Field?.value && !/^\d{9}$/.test(contacto1Field.value.replace(/\D/g,''))) { alert("Formato inválido para 'Telefone'. Deve conter 9 dígitos."); return; }
        const contacto2Field = formData.find(f => f.key === 'contactoC2');
        if (contacto2Field?.value && !/^\d{9}$/.test(contacto2Field.value.replace(/\D/g,''))) { alert("Formato inválido para 'Telefone 2'. Deve conter 9 dígitos (se preenchido)."); return; }
        if (!cpField?.value?.trim()) { alert("O campo 'Código Postal' é obrigatório."); return; }
        if (!validateCodigoPostal(cpField?.value)) { alert("Formato inválido para Código Postal (Ex: 1234-567 ou 1234567)."); return; }

        setIsUpdating(true);
        setError(null);
        // Prepare the payload using the transformation function
        const dataToSend = transformFormDataToApiData(formData);

        try {
            // Send PUT request to the '/me' endpoint
            await fetchWithAuth(`/api/clientes/me`, {
                method: 'PUT',
                body: dataToSend // fetchWithAuth stringifies if it's an object
            });

            // Re-fetch profile data on success to show the latest info
            const refreshedData = await fetchWithAuth(`/api/clientes/me`);
            if (refreshedData) {
                const dataWithEmail = { ...refreshedData, email: refreshedData.email || user?.email };
                setOriginalData(refreshedData);
                setFormData(transformApiDataToFormData(dataWithEmail));
            } else {
                console.warn("Não foi possível re-buscar os dados após atualização.");
                // Consider a less disruptive update, maybe just merge dataToSend back if safe
                // setFormData(transformApiDataToFormData({...originalData, ...dataToSend, email: user?.email}));
            }

            alert("Dados atualizados com sucesso!");
        } catch (err) {
            console.error("Erro ao atualizar dados:", err);
            const errorMsg = err.data?.detail || err.data?.title || err.message || "Não foi possível atualizar os dados.";
            setError(errorMsg);
            alert(`Erro ao atualizar: ${errorMsg}`);
        } finally {
            setIsUpdating(false);
        }
    };

    // Handles the deletion of the client's account
    const handleDelete = async () => {
        // Use the ID stored from the initial fetch
        if (!originalData?.idcliente) {
            alert("Erro: ID do cliente não encontrado. Não é possível eliminar.");
            return;
        }
        // Ask for confirmation
        if (!window.confirm("Tem a certeza absoluta que deseja eliminar a sua conta? Esta ação é irreversível e todos os seus dados associados serão perdidos.")) {
            return;
        }

        setIsDeleting(true);
        setError(null);
        try {
            // Send DELETE request using the specific client ID
            await fetchWithAuth(`/api/Clientes/${originalData.idcliente}`, { method: 'DELETE' });
            alert("A sua conta foi eliminada com sucesso.");
            logout(); // Log the user out
            navigate('/'); // Redirect to home or login page
        } catch (err) {
            console.error("Erro ao eliminar conta:", err);
            const errorMsg = err.message || "Ocorreu um erro ao tentar eliminar a conta.";
            setError(errorMsg);
            alert(`Erro ao eliminar: ${errorMsg}`);
        } finally {
            setIsDeleting(false);
        }
    };

    // Helper variables for conditional rendering and disabling elements
    const userName = formData.find(item => item.key === 'nomeCliente')?.value || (isLoading ? "A carregar..." : (error ? "Erro" : "Utilizador"));
    const disableFields = isLoading || isUpdating || isDeleting || !!error;
    const disableActions = isLoading || isUpdating || isDeleting;

    // ---- JSX Rendering ----
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
            <ClientHeader userImage={userImage} /> {/* Client specific header */}
            <main className="max-w-7xl mx-auto p-6 flex-grow">
                <h2 className="text-gray-400 text-sm mb-4">Informação do Perfil</h2>
                <div className="bg-white rounded-xl shadow p-6 md:p-10 grid md:grid-cols-3 gap-8 min-h-[400px]">

                    {/* Left Panel: Image and Greeting */}
                    <div className={`col-span-1 flex flex-col justify-center items-center text-center gap-4 pr-10 border-r border-gray-200`}>
                        <div className="rounded-full w-40 h-40 object-cover border overflow-hidden bg-gray-100 flex items-center justify-center">
                            {userImage ? (<img src={userImage} alt="Foto do utilizador" className="w-full h-full" />) : (<PlaceholderUserIcon />)}
                        </div>
                        <div>
                            <p className="text-lg font-semibold">Olá,</p>
                            <p className={`text-xl font-bold ${error && !isLoading ? 'text-red-500' : ''}`}>{userName}</p>
                        </div>
                    </div>

                    {/* Right Panel: Form */}
                    <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[600px] pr-2">
                        {/* Loading Indicator */}
                        {isLoading && <div className="col-span-full text-center text-gray-500 py-10">A carregar dados do perfil...</div>}

                        {/* Error Display */}
                        {error && !isLoading && (
                            <div className="col-span-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                                <strong className="font-bold">Erro ao carregar perfil: </strong>
                                <span className="block sm:inline">{error}</span>
                                <button onClick={() => window.location.reload()} className="ml-4 text-sm underline">Tentar Recarregar</button>
                            </div>
                        )}

                        {/* Form Fields (only render if not loading and no critical error preventing data display) */}
                        {!isLoading && formData.length > 0 && formData.map((item, i) => {
                            // Special handling for estadoValCc field
                            if (item.key === 'estadoValCc') {
                                const isValidated = item.value === "true";
                                return (
                                    <div key={item.key || i}>
                                        <label htmlFor={item.key} className="block text-sm font-medium text-gray-700 mb-1">
                                            {item.label}
                                            {item.readOnly && <span className="text-xs text-gray-500"> (não editável)</span>}
                                        </label>
                                        <div 
                                            className={`p-2.5 rounded-md ${isValidated ? 'bg-green-100' : 'bg-red-100'} relative group`}
                                            title={!isValidated ? "Deverá dirigir-se à nossa loja para re-validar a carta de condução" : ""}
                                        >
                                            <span className="font-light">
                                                {isValidated ? "Confirmada" : "Ação necessária"}
                                            </span>
                                            {!isValidated && (
                                                <div className="hidden group-hover:block absolute left-0 top-full mt-2 p-2 bg-gray-800 text-white text-sm rounded-md z-10 w-64">
                                                    Deverá dirigir-se à nossa loja para re-validar a carta de condução
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            }

                            // Regular rendering for other fields
                            return (
                                <div key={item.key || i}>
                                    <label htmlFor={item.key} className="block text-sm font-medium text-gray-700 mb-1">
                                        {item.label}
                                        {item.readOnly && <span className="text-xs text-gray-500"> (não editável)</span>}
                                    </label>
                                    <InputFieldLong
                                        id={item.key}
                                        name={item.key}
                                        type={item.type || "text"}
                                        placeholder={item.label}
                                        value={item.value}
                                        onChange={(e) => handleChange(i, e.target.value)}
                                        disabled={disableFields || item.readOnly}
                                        className={`${(disableFields || item.readOnly) ? 'bg-gray-100 cursor-not-allowed opacity-70' : ''}`}
                                        readOnly={item.readOnly}
                                        // Add patterns for basic validation if desired
                                        pattern={item.key === 'contactoC1' || item.key === 'contactoC2' ? "[0-9]{9}" : undefined}
                                        title={item.key === 'contactoC1' || item.key === 'contactoC2' ? "Deve conter 9 dígitos" : undefined}
                                    />
                                </div>
                            );
                        })}

                        {/* Action Buttons (only render if not loading and data was successfully fetched initially) */}
                        {!isLoading && originalData && (
                            <div className="flex gap-4 mt-4 col-span-full justify-end">
                                <Button
                                    text={isDeleting ? "A eliminar..." : "Eliminar Conta"}
                                    variant="danger"
                                    onClick={handleDelete}
                                    className="!py-1"
                                    disabled={disableActions}
                                />
                                <Button
                                    text={isUpdating ? "A atualizar..." : "Atualizar Informação"}
                                    variant="primary"
                                    onClick={handleUpdate}
                                    className="!py-1"
                                    disabled={disableActions}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

// Helper function for CP validation (example)
const validateCodigoPostal = (cp) => {
    if (!cp) return false;
    const cpDigits = cp.replace(/\D/g, '');
    return /^\d{7}$/.test(cpDigits);
};


export default ClientePerfil;
