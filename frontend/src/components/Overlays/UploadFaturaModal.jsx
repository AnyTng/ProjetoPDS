import React, { useState, useEffect } from 'react';
import Button from '../button.jsx';
import InputFieldLong from '../inputFieldLong.jsx';
import XIcon from '../../assets/XIconBlack.svg';
import UploadIcon from '../../assets/UploadIcon.svg'; // Ícone para o botão do ficheiro

const initialFormData = {
    idTransacao: '', // ID Aluguer/Serviço/Multa?
    tipoDespesa: '', // Descrição do tipo
    valor: '',
    veiculoAssociado: '', // ID ou Matrícula
    idServicoAssociado: '', // ID Multa/Manutencao/Aluguer
    nomeServico: '', // Dropdown: 'Multa', 'Aluguer', 'Manutenção', 'Outro'
};

const UploadFaturaModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState(initialFormData);
    const [selectedFile, setSelectedFile] = useState(null); // Estado para o ficheiro
    const [fileName, setFileName] = useState(""); // Para mostrar nome do ficheiro

    // Reset form when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setFormData(initialFormData);
            setSelectedFile(null);
            setFileName("");
        }
    }, [isOpen]);

    // Handler genérico para inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handler específico para o input de ficheiro
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === "application/pdf") { // Validar se é PDF
            setSelectedFile(file);
            setFileName(file.name);
        } else {
            setSelectedFile(null);
            setFileName("");
            if (file) { // Se selecionou ficheiro mas não é PDF
                alert("Por favor, selecione um ficheiro PDF.");
            }
        }
    };

    // Handler para submeter o formulário
    const handleSubmit = (e) => {
        e.preventDefault();
        // Validação básica
        if (!selectedFile) {
            alert("Por favor, selecione um ficheiro PDF para enviar.");
            return;
        }
        // Adicionar mais validações dos campos se necessário
        if (!formData.idTransacao || !formData.valor || !formData.nomeServico) {
            alert("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        // Chama o onSubmit do pai, passando os dados do form e o ficheiro
        onSubmit(formData, selectedFile);
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white p-6 md:p-8 rounded-xl shadow-lg w-full max-w-2xl relative" // Aumentar largura se necessário
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-6 h-6 text-gray-500 hover:text-gray-800"
                    aria-label="Fechar"
                >
                    <img src={XIcon} alt="Fechar" className="w-full h-full" />
                </button>

                <h2 className="text-xl font-semibold mb-6 text-center text-gray-800">
                    Enviar Nova Fatura
                </h2>

                {/* Usar grid para organizar melhor o formulário */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Coluna 1 */}
                        <div className='space-y-4'>
                            <div>
                                <label className="lbl">Nome Serviço (Tipo)</label>
                                <select
                                    name="nomeServico"
                                    value={formData.nomeServico}
                                    onChange={handleChange}
                                    className="input-select" // Usar classe do EditVehicleModal se existir ou estilizar
                                    required
                                >
                                    <option value="" disabled>Selecione o tipo...</option>
                                    <option value="Multa">Multa</option>
                                    <option value="Aluguer">Aluguer</option>
                                    <option value="Manutenção">Manutenção</option>
                                    <option value="Outro">Outro</option>
                                </select>
                            </div>
                            <div>
                                <label className="lbl">ID Transação/Serviço Associado</label>
                                <InputFieldLong type="text" name="idTransacao" placeholder="ID Aluguer/Multa/Manutenção" value={formData.idTransacao} onChange={handleChange} required />
                            </div>
                            <div>
                                <label className="lbl">Veículo Associado (ID/Matrícula)</label>
                                <InputFieldLong type="text" name="veiculoAssociado" placeholder="Ex: C-001 ou AA-00-BB" value={formData.veiculoAssociado} onChange={handleChange} />
                            </div>
                        </div>
                        {/* Coluna 2 */}
                        <div className='space-y-4'>
                            <div>
                                <label className="lbl">Tipo Despesa (Descrição)</label>
                                <InputFieldLong type="text" name="tipoDespesa" placeholder="Descrição breve" value={formData.tipoDespesa} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="lbl">Valor (€)</label>
                                <InputFieldLong type="number" step="0.01" name="valor" placeholder="Ex: 150.50" value={formData.valor} onChange={handleChange} required />
                            </div>
                            <div>
                                <label className="lbl">Ficheiro PDF</label>
                                {/* Input de ficheiro estilizado */}
                                <label className="input-file-label">
                                    <img src={UploadIcon} alt="Upload" className="w-5 h-5 mr-2"/>
                                    <span className="truncate">{fileName || "Selecionar PDF..."}</span>
                                    <input
                                        type='file'
                                        className="hidden"
                                        onChange={handleFileChange}
                                        accept="application/pdf" // Aceita apenas PDF
                                        required // Ficheiro é obrigatório
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Botões */}
                    <div className="flex justify-end gap-4 pt-6">
                        <Button text="Cancelar" variant="secondary" type="button" onClick={onClose} className="!py-1.5" />
                        <Button text="Enviar Fatura" variant="primary" type="submit" className="!py-1.5" />
                    </div>
                </form>
                {/* Reutilizar estilos se definidos globalmente ou no EditVehicleModal */}
                <style jsx>{`
                    .lbl { display: block; text-sm: ; font-medium; color: #4a5568; margin-bottom: 0.25rem; }
                    .input-select { width: 100%; padding: 0.5rem; margin-top: 0.25rem; border-radius: 0.25rem; border: 1px solid #cbd5e0; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 0.5rem center; background-size: 1.5em 1.5em; padding-right: 2.5rem;}
                    .input-file-label { display: flex; width: 100%; align-items: center; padding: 0.5rem 1rem; background-color: white; color: #4299e1; /* Azul Tailwind */ border-radius: 0.25rem; border: 1px solid #cbd5e0; /* Cinza Tailwind */ cursor: pointer; transition: all 0.15s ease-in-out; }
                    .input-file-label:hover { background-color: #ebf8ff; /* Azul claro Tailwind */ border-color: #4299e1; }
                `}</style>
            </div>
        </div>
    );
};

export default UploadFaturaModal;