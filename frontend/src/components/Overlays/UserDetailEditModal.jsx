import React, { useState, useEffect, useRef } from 'react';
import Button from '../button.jsx';
import InputFieldLong from '../inputFieldLong.jsx';
import XIcon from '../../assets/XIconBlack.svg';
import { fetchWithAuth } from '../../utils/api';


const UserDetailEditModal = ({ isOpen, onClose, onSubmit, userData, userId, isLoading, error }) => {
    const initialFormData = {
        nomeCliente: '',
        dataNascCliente: '',
        nifCliente: '',
        ruaCliente: '',
        codigoPostal: '',
        localidade: '',
        email: '',
        password: '',
        contactoC1: '',
        contactoC2: '',
        estadoValCc: false,
    };

    const [formData, setFormData] = useState(initialFormData);
    // Image state removed
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    // fileInputRef removed

    useEffect(() => {
        if (userData) {
            const formattedDate = userData.dataNascCliente
                ? new Date(userData.dataNascCliente).toISOString().split('T')[0]
                : '';

            setFormData({
                nomeCliente: userData.nomeCliente || '',
                dataNascCliente: formattedDate,
                nifCliente: userData.nifCliente || '',
                ruaCliente: userData.ruaCliente || '',
                codigoPostal: userData.codigoPostal || '',
                localidade: userData.localidade || '',
                email: userData.email || '',
                password: '',
                contactoC1: userData.contactoC1 || '',
                contactoC2: userData.contactoC2 ?? '',
                estadoValCc: userData.estadoValCc || false,
            });
            setSubmitError(null);
        } else {
            setFormData(initialFormData);
            setSubmitError(null);
        }
    }, [userData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    // Image handlers removed

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const dataToSend = {
                ...formData,
                idcliente: userId,
            };

            // Image handling removed

            // Format Numbers and Nullable Fields
            if (dataToSend.contactoC2 === '' || dataToSend.contactoC2 === null) {
                dataToSend.contactoC2 = null;
            } else {
                const parsedC2 = parseInt(dataToSend.contactoC2, 10);
                dataToSend.contactoC2 = !isNaN(parsedC2) ? parsedC2 : null;
            }
            if (dataToSend.contactoC1 === '' || dataToSend.contactoC1 === null) {
                dataToSend.contactoC1 = 0;
            } else {
                const parsedC1 = parseInt(dataToSend.contactoC1, 10);
                dataToSend.contactoC1 = !isNaN(parsedC1) ? parsedC1 : 0;
            }
            if (dataToSend.nifCliente === '' || dataToSend.nifCliente === null) {
                dataToSend.nifCliente = 0;
            } else {
                const parsedNif = parseInt(dataToSend.nifCliente, 10);
                dataToSend.nifCliente = !isNaN(parsedNif) ? parsedNif : 0;
            }

            // Password Handling
            if (!dataToSend.password) {
                delete dataToSend.password;
            }

            // Date Handling
            if (!dataToSend.dataNascCliente) {
                dataToSend.dataNascCliente = null;
            }

            // Call onSubmit without image file
            await onSubmit(userId, dataToSend);

        } catch (err) {
            console.error("Erro ao submeter formulário:", err);
            let errorMessage = "Ocorreu um erro ao guardar as alterações.";
            if (err.response && err.response.data && err.response.data.errors) {
                const errors = err.response.data.errors;
                const errorMessages = Object.values(errors).flat();
                errorMessage = `Erro de validação: ${errorMessages.join(' ')}`;
            } else if (err.message) {
                errorMessage = err.message;
            }
            setSubmitError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
                {/* Header */}
                <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-300">
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-800">Detalhes e Edição do Utilizador</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800" disabled={isSubmitting}>
                        <img src={XIcon} alt="Fechar" className="w-6 h-6" />
                    </button>
                </div>

                {/* Loading/Error States */}
                {isLoading && <div className="text-center py-10">A carregar detalhes...</div>}
                {!isLoading && error && <div className="text-red-600 text-center py-10">{error}</div>}

                {/* Form Content */}
                {!isLoading && !error && userData && (
                    <form onSubmit={handleSubmit}>
                        {/* Input Fields Grid - Labels are passed via the 'label' prop */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-6">
                            <InputFieldLong
                                label="Nome Completo" // Label already exists
                                name="nomeCliente"
                                value={formData.nomeCliente}
                                onChange={handleChange}
                                placeholder="Nome completo do cliente" // Added Placeholder
                                required
                                disabled={isSubmitting}
                            />
                            <InputFieldLong
                                label="NIF" // Label already exists
                                name="nifCliente"
                                value={formData.nifCliente}
                                onChange={handleChange}
                                type="tel" // Using tel for flexibility, parsed in submit
                                placeholder="Número de Identificação Fiscal" // Added Placeholder
                                required
                                disabled={isSubmitting}
                            />
                            <InputFieldLong
                                label="Data de Nascimento" // Label already exists
                                name="dataNascCliente"
                                value={formData.dataNascCliente}
                                onChange={handleChange}
                                type="date"
                                // No placeholder for date type
                                required
                                disabled={isSubmitting}
                            />
                            <InputFieldLong
                                label="Email" // Label already exists
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                type="email"
                                placeholder="exemplo@email.com" // Added Placeholder
                                required
                                disabled={isSubmitting}
                            />
                            <InputFieldLong
                                label="Nova Password (opcional)" // Label already exists
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Deixar em branco para manter a atual" // Existing Placeholder
                                disabled={isSubmitting}
                            />
                            <InputFieldLong
                                label="Contacto Principal" // Label already exists
                                name="contactoC1"
                                value={formData.contactoC1}
                                onChange={handleChange}
                                type="tel"
                                placeholder="9XXXXXXXX" // Added Placeholder
                                required
                                disabled={isSubmitting}
                            />
                            <InputFieldLong
                                label="Contacto Secundário" // Label already exists
                                name="contactoC2"
                                value={formData.contactoC2}
                                onChange={handleChange}
                                type="tel"
                                placeholder="9XXXXXXXX (opcional)" // Updated Placeholder
                                disabled={isSubmitting}
                            />
                            <InputFieldLong
                                label="Rua" // Label already exists
                                name="ruaCliente"
                                value={formData.ruaCliente}
                                onChange={handleChange}
                                placeholder="Nome da Rua e Número" // Added Placeholder
                                required
                                disabled={isSubmitting}
                            />
                            <InputFieldLong
                                label="Código Postal" // Label already exists
                                name="codigoPostal"
                                value={formData.codigoPostal}
                                onChange={handleChange}
                                placeholder="XXXX-XXX" // Added Placeholder
                                required
                                disabled={isSubmitting}
                            />
                            <InputFieldLong
                                label="Localidade" // Label already exists
                                name="localidade"
                                value={formData.localidade}
                                onChange={handleChange}
                                placeholder="Freguesia, Concelho" // Added Placeholder
                                required
                                disabled={isSubmitting}
                                readOnly // Still read-only
                            />

                            {/* estadoValCc Checkbox with its label */}
                            <div className="md:col-span-2 flex items-center gap-2">
                                <input type="checkbox" id="estadoValCc" name="estadoValCc" checked={formData.estadoValCc} onChange={handleChange} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" disabled={isSubmitting} />
                                <label htmlFor="estadoValCc" className="text-sm text-gray-700">Estado Validação CC</label> {/* Label for checkbox */}
                            </div>
                        </div>

                        {/* Submit Error Message */}
                        {submitError && (
                            <div className="text-red-600 text-sm text-center pt-4">{submitError}</div>
                        )}

                        {/* Buttons */}
                        <div className="flex justify-end gap-4 pt-6">
                            <Button text="Cancelar" variant="secondary" type="button" onClick={onClose} className="!py-1.5" disabled={isSubmitting} />
                            <Button text={isSubmitting ? "A Enviar..." : "Enviar Alterações"} variant="primary" type="submit" className="!py-1.5" disabled={isSubmitting} />
                        </div>
                    </form>
                )}

                {/* Close Button on Error without Data */}
                {!isLoading && error && !userData && (
                    <div className="flex justify-end pt-6">
                        <Button text="Fechar" variant="secondary" type="button" onClick={onClose} className="!py-1.5" />
                    </div>
                )}

                <style jsx>{/* Minimal styles */}</style>
            </div>
        </div>
    );
};

export default UserDetailEditModal;
