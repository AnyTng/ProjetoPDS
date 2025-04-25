import React, { useState, useEffect, useRef } from 'react';
import Button from '../button.jsx';
import InputFieldLong from '../inputFieldLong.jsx'; // Assuming this exists
import XIcon from '../../assets/XIconBlack.svg'; // Assuming this exists
import { fetchWithAuth } from '../../utils/api'; // Import fetchWithAuth

// Helper function to read file as Base64
const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result); // Returns the full data URL string
    reader.onerror = reject;
});

const UserDetailEditModal = ({ isOpen, onClose, onSubmit, userData, userId, isLoading, error }) => {
    // Initialize state with expected keys, default to empty or appropriate values
    const initialFormData = {
        nomeCliente: '',
        dataNascCliente: '',
        nifCliente: '',
        ruaCliente: '',
        codigoPostal: '',
        localidade: '',
        email: '',
        password: '', // Keep password separate or empty initially
        contactoC1: '',
        contactoC2: '',
        estadoValCc: false,
        // imagemBase64 is handled separately (from userData or new upload)
        // caminhoImagem is usually handled by backend based on image upload
    };

    const [formData, setFormData] = useState(initialFormData);
    const [newImageFile, setNewImageFile] = useState(null);
    const [newImagePreview, setNewImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    const fileInputRef = useRef(null);

    // Populate form when userData is available
    useEffect(() => {
        if (userData) {
            setFormData({
                nomeCliente: userData.nomeCliente || '',
                // Format date for input type="date" (YYYY-MM-DD)
                dataNascCliente: userData.dataNascCliente ? new Date(userData.dataNascCliente).toISOString().split('T')[0] : '',
                nifCliente: userData.nifcliente ?? '', // Use ?? for null/undefined
                ruaCliente: userData.ruaCliente || '',
                codigoPostal: userData.codigoPostal || '',
                localidade: userData.localidade || '',
                email: userData.email || '',
                password: '', // Always start empty for editing security
                contactoC1: userData.contactoC1 ?? '',
                contactoC2: userData.contactoC2 ?? '',
                estadoValCc: userData.estadoValCc === true, // Ensure boolean
            });
            setNewImageFile(null); // Reset file input on user change
            setNewImagePreview(null); // Reset preview
            setSubmitError(null); // Clear previous submission errors
        } else if (!isOpen) {
            setFormData(initialFormData); // Reset form if closed without data
            setNewImageFile(null);
            setNewImagePreview(null);
            setSubmitError(null);
        }
    }, [userData, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewImageFile(file);
            try {
                const base64Preview = await toBase64(file);
                setNewImagePreview(base64Preview); // Set preview for display
            } catch (err) {
                console.error("Erro ao gerar preview da imagem:", err);
                setNewImagePreview(null); // Reset preview on error
            }
        } else {
            setNewImageFile(null);
            setNewImagePreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError(null); // Clear previous errors

        // Frontend Validation (basic)
        if (!formData.nomeCliente) return setSubmitError("Nome do cliente é obrigatório.");
        if (!formData.codigoPostal) return setSubmitError("Código Postal é obrigatório.");
        if (!/^\d{4}-\d{3}$/.test(formData.codigoPostal) && !/^\d{7}$/.test(formData.codigoPostal)) {
            return setSubmitError("Formato do Código Postal inválido (use NNNN-NNN ou NNNNNNN).");
        }
        if (formData.contactoC1 && !/^\d{9}$/.test(formData.contactoC1)) {
            return setSubmitError("Contacto principal deve ter 9 dígitos.");
        }
        if (formData.contactoC2 && !/^\d{9}$/.test(formData.contactoC2)) {
            return setSubmitError("Contacto secundário deve ter 9 dígitos.");
        }


        setIsSubmitting(true);

        let finalImagemBase64 = userData?.imagemBase64 || null; // Start with existing image

        // If a new image was selected, convert it to the full Base64 string
        if (newImageFile) {
            try {
                finalImagemBase64 = await toBase64(newImageFile);
            } catch (err) {
                console.error("Erro ao converter nova imagem para Base64:", err);
                setSubmitError("Erro ao processar a nova imagem.");
                setIsSubmitting(false);
                return;
            }
        }

        // --- Payload Construction ---
        const payload = {
            idcliente: userId, // Crucial: ID from props/userData
            nomeCliente: formData.nomeCliente,
            // Convert YYYY-MM-DD back to ISO string with time if backend needs it
            dataNascCliente: formData.dataNascCliente ? `${formData.dataNascCliente}T00:00:00.000Z` : null,
            // Convert number fields, send null if empty
            nifCliente: formData.nifCliente ? parseInt(formData.nifCliente, 10) : null,
            ruaCliente: formData.ruaCliente || null,
            // Send CP as string (backend handles parsing/validation)
            codigoPostal: formData.codigoPostal.replace("-",""), // Remove hyphen if present before sending just digits
            localidade: formData.localidade || null,
            email: formData.email || null,
            // Only send password if user entered something
            password: formData.password ? formData.password : null,
            contactoC1: formData.contactoC1 ? parseInt(formData.contactoC1, 10) : null,
            contactoC2: formData.contactoC2 ? parseInt(formData.contactoC2, 10) : null,
            estadoValCc: formData.estadoValCc, // Should be boolean from checkbox state
            // Include image data (backend needs to handle this)
            imagemBase64: finalImagemBase64,
            // Include original path (backend needs to handle this)
            caminhoImagem: userData?.caminhoImagem || null,
        };

        // **IMPORTANT:** Your provided C# backend code doesn't handle imagemBase64 or caminhoImagem updates.
        // The frontend sends it as requested, but the backend needs modification to save the new image.

        console.log("Payload a ser enviado:", payload);

        // Call the onSubmit passed from the parent (usersPageAdmin.jsx)
        await onSubmit(userId, payload);

        setIsSubmitting(false);
        // Parent component (usersPageAdmin) handles closing modal on success/error messages
    };

    // ----- Renderização -----
    if (!isOpen) return null;

    const currentImageSrc = newImagePreview || userData?.imagemBase64;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-y-auto"
            onClick={onClose}
        >
            <div
                className="bg-white p-6 md:p-8 rounded-xl shadow-lg w-full max-w-4xl relative my-8" // Increased max-width
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-6 h-6 text-gray-500 hover:text-gray-800 disabled:opacity-50"
                    aria-label="Fechar"
                    disabled={isSubmitting}
                >
                    <img src={XIcon} alt="Fechar" className="w-full h-full" />
                </button>

                <h2 className="text-xl font-semibold mb-6 text-center text-gray-800">
                    Editar Utilizador #{userId || '...'}
                </h2>

                {isLoading && (
                    <div className="text-center p-10 text-gray-500">A carregar detalhes...</div>
                )}
                {error && !isLoading && (
                    <div className="text-center p-10 text-red-600">Erro ao carregar detalhes: {error}</div>
                )}

                {!isLoading && !error && userData && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                            {/* --- Coluna 1: Info Pessoal --- */}
                            <div className='space-y-4'>
                                <div>
                                    <label className="lbl">Nome Cliente<span className="text-red-500">*</span></label>
                                    <InputFieldLong name="nomeCliente" value={formData.nomeCliente} onChange={handleChange} required disabled={isSubmitting} />
                                </div>
                                <div>
                                    <label className="lbl">Email<span className="text-red-500">*</span></label>
                                    <InputFieldLong name="email" type="email" value={formData.email} onChange={handleChange} required disabled={isSubmitting} />
                                </div>
                                <div>
                                    <label className="lbl">Data de Nascimento</label>
                                    <InputFieldLong name="dataNascCliente" type="date" value={formData.dataNascCliente} onChange={handleChange} disabled={isSubmitting} />
                                </div>
                                <div>
                                    <label className="lbl">NIF</label>
                                    <InputFieldLong name="nifCliente" type="number" value={formData.nifCliente} onChange={handleChange} disabled={isSubmitting} />
                                </div>
                                <div>
                                    <label className="lbl">Nova Password (opcional)</label>
                                    <InputFieldLong name="password" type="password" placeholder="Deixar vazio para não alterar" value={formData.password} onChange={handleChange} disabled={isSubmitting} />
                                </div>
                                <div className="flex items-center gap-2 pt-2">
                                    <input
                                        type="checkbox"
                                        id="estadoValCc"
                                        name="estadoValCc"
                                        checked={formData.estadoValCc}
                                        onChange={handleChange}
                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        disabled={isSubmitting}
                                    />
                                    <label htmlFor="estadoValCc" className="lbl !mb-0">Estado CC Válido</label>
                                </div>
                            </div>

                            {/* --- Coluna 2: Morada e Contactos --- */}
                            <div className='space-y-4'>
                                <div>
                                    <label className="lbl">Rua</label>
                                    <InputFieldLong name="ruaCliente" value={formData.ruaCliente} onChange={handleChange} disabled={isSubmitting} />
                                </div>
                                <div>
                                    <label className="lbl">Código Postal<span className="text-red-500">*</span></label>
                                    <InputFieldLong name="codigoPostal" placeholder="Ex: 4700-123 ou 4700123" value={formData.codigoPostal} onChange={handleChange} required disabled={isSubmitting} />
                                </div>
                                <div>
                                    <label className="lbl">Localidade<span className="text-red-500">*</span></label>
                                    <InputFieldLong name="localidade" value={formData.localidade} onChange={handleChange} required disabled={isSubmitting} />
                                    <p className="text-xs text-gray-500 mt-1">Obrigatório se o Código Postal for novo.</p>
                                </div>
                                <div>
                                    <label className="lbl">Contacto Principal<span className="text-red-500">*</span></label>
                                    <InputFieldLong name="contactoC1" type="tel" pattern="[0-9]{9}" title="9 dígitos numéricos" value={formData.contactoC1} onChange={handleChange} required disabled={isSubmitting} />
                                </div>
                                <div>
                                    <label className="lbl">Contacto Secundário</label>
                                    <InputFieldLong name="contactoC2" type="tel" pattern="[0-9]{9}" title="9 dígitos numéricos" value={formData.contactoC2} onChange={handleChange} disabled={isSubmitting} />
                                </div>
                            </div>

                            {/* --- Coluna 3: Imagem --- */}
                            <div className='space-y-4'>
                                <label className="lbl">Imagem de Perfil</label>
                                <div className='flex flex-col items-center gap-4'>
                                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-300">
                                        {currentImageSrc ? (
                                            <img
                                                src={currentImageSrc}
                                                alt="Pré-visualização"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4a4 4 0 110 8 4 4 0 010-8zM16 14H8a4 4 0 00-4 4v1h16v-1a4 4 0 00-4-4z" /></svg>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageChange}
                                        accept="image/jpeg, image/png, image/jpg" // Aceitar tipos comuns
                                        className="hidden" // Esconder input padrão
                                        disabled={isSubmitting}
                                    />
                                    <Button
                                        text="Escolher Nova Imagem"
                                        variant="secondary"
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()} // Acionar clique no input escondido
                                        className="!py-1.5 !px-3 text-sm"
                                        disabled={isSubmitting}
                                    />
                                    {newImageFile && (
                                        <p className="text-xs text-gray-600 text-center">
                                            Ficheiro selecionado: {newImageFile.name}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* --- Erro de Submissão --- */}
                        {submitError && (
                            <div className="text-red-600 text-sm text-center pt-2">{submitError}</div>
                        )}

                        {/* --- Botões --- */}
                        <div className="flex justify-end gap-4 pt-6">
                            <Button text="Cancelar" variant="secondary" type="button" onClick={onClose} className="!py-1.5" disabled={isSubmitting} />
                            <Button
                                text={isSubmitting ? "A Enviar..." : "Enviar Alterações"}
                                variant="primary"
                                type="submit"
                                className="!py-1.5"
                                disabled={isSubmitting}
                            />
                        </div>
                    </form>
                )}

                {/* Botão de fechar caso só haja erro e não haja dados */}
                {!isLoading && error && !userData && (
                    <div className="flex justify-end pt-6">
                        <Button text="Fechar" variant="secondary" type="button" onClick={onClose} className="!py-1.5" />
                    </div>
                )}

                <style jsx>{`
                    .lbl { display: block; text-sm; font-medium; color: #4a5568; margin-bottom: 0.25rem; }
                    /* InputFieldLong should handle its own styles */
                `}</style>
            </div>
        </div>
    );
};

export default UserDetailEditModal;