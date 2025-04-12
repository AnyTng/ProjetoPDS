import React, { useState, useEffect } from 'react';
import Button from '../button.jsx';
import InputFieldLong from '../inputFieldLong.jsx'; // Usar onde aplicável
import XIcon from '../../assets/XIconBlack.svg';

// Estado inicial baseado na tabela e campos necessários
const initialFormData = {
    matriculaVeiculo: '',
    lotacaoVeiculo: '',
    taraVeiculo: '',
    descCor: '',
    dataLegal: '',
    dataFabricacao: '',
    dataAquisicao: '',
    valorDiarioVeiculo: '',
    marca: '', // Campo para utilizador
    modelo: '', // Campo para utilizador
    classeVeiculo: '', // Usar select ou text input simples por agora
    estadoVeiculo: 'Disponível', // Manter o select de texto
    combustivel: '',
    // foto não fica aqui, vai para o estado do ficheiro
};

const AddVehicleModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState(initialFormData);
    const [selectedFile, setSelectedFile] = useState(null); // Estado para o ficheiro da foto
    const [fileName, setFileName] = useState(""); // Estado para mostrar nome do ficheiro

    // Reset form when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setFormData(initialFormData);
            setSelectedFile(null);
            setFileName("");
        }
    }, [isOpen]);

    // Handler genérico para inputs de texto/numero/data/select
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handler específico para o input de ficheiro
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setFileName(file.name);
        } else {
            setSelectedFile(null);
            setFileName("");
        }
    };

    // Handler para submeter o formulário
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Submitting vehicle data:", formData);
        console.log("Selected file:", selectedFile ? selectedFile.name : "None");

        // !! IMPORTANTE !!
        // Quando ligares à API:
        // 1. Cria um objeto FormData: const dataToSend = new FormData();
        // 2. Adiciona os campos do formData: Object.keys(formData).forEach(key => dataToSend.append(key, formData[key]));
        // 3. Adiciona o ficheiro: if (selectedFile) { dataToSend.append('fotoVeiculo', selectedFile, selectedFile.name); } // O nome 'fotoVeiculo' deve corresponder ao esperado pelo backend
        // 4. Envia 'dataToSend' na tua chamada fetch/axios, ajustando os headers (normalmente não precisas de 'Content-Type', o browser define-o para multipart/form-data)

        onSubmit(formData, selectedFile); // Passa ambos para a função onSubmit do pai (placeholder)
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 overflow-y-auto p-4" // Adicionado overflow e padding
            onClick={onClose}
        >
            <div
                className="bg-white p-6 md:p-8 rounded-xl shadow-lg w-full max-w-3xl relative my-8" // Aumentado max-w e adicionado my-8
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
                    Adicionar Novo Veículo
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Linha: Marca, Modelo, Matrícula */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                            <InputFieldLong type="text" name="marca" placeholder="Ex: BMW" value={formData.marca} onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                            <InputFieldLong type="text" name="modelo" placeholder="Ex: Série 3" value={formData.modelo} onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Matrícula</label>
                            <InputFieldLong type="text" name="matriculaVeiculo" placeholder="Ex: AA-00-BB" value={formData.matriculaVeiculo} onChange={handleChange} required />
                        </div>
                    </div>

                    {/* Linha: Lotação, Tara, Cor */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Lotação</label>
                            <InputFieldLong type="number" name="lotacaoVeiculo" placeholder="Ex: 5" value={formData.lotacaoVeiculo} onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tara (kg)</label>
                            <InputFieldLong type="number" name="taraVeiculo" placeholder="Ex: 1500" value={formData.taraVeiculo} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
                            <InputFieldLong type="text" name="descCor" placeholder="Ex: Preto Metalizado" value={formData.descCor} onChange={handleChange} required />
                        </div>
                    </div>

                    {/* Linha: Data Fabrico, Data Legal, Data Aquisição */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Data Fabrico</label>
                            <InputFieldLong type="date" name="dataFabricacao" value={formData.dataFabricacao} onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Data Legal</label>
                            <InputFieldLong type="date" name="dataLegal" value={formData.dataLegal} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Data Aquisição</label>
                            <InputFieldLong type="date" name="dataAquisicao" value={formData.dataAquisicao} onChange={handleChange} required />
                        </div>
                    </div>

                    {/* Linha: Valor Diário, Classe, Combustível */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Valor Diário (€)</label>
                            <InputFieldLong type="number" step="0.01" name="valorDiarioVeiculo" placeholder="Ex: 65.50" value={formData.valorDiarioVeiculo} onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Classe</label>
                            {/* Usar select se tiveres as classes, senão input texto */}
                            <InputFieldLong type="text" name="classeVeiculo" placeholder="Ex: C" value={formData.classeVeiculo} onChange={handleChange} required />
                            {/* Exemplo Select:
                             <select name="classeVeiculo" value={formData.classeVeiculo} onChange={handleChange} className="w-full p-2 mt-1 border rounded border-gray-300 focus:ring-blue-500 focus:border-blue-500">
                                 <option value="">Selecione...</option>
                                 <option value="A">A</option>
                                 <option value="B">B</option>
                                  ... etc ...
                             </select> */}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Combustível</label>
                            <InputFieldLong type="text" name="combustivel" placeholder="Ex: Diesel" value={formData.combustivel} onChange={handleChange} required />
                        </div>
                    </div>

                    {/* Linha: Estado, Foto */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end"> {/* items-end para alinhar */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                            <select
                                name="estadoVeiculo"
                                value={formData.estadoVeiculo}
                                onChange={handleChange}
                                className="w-full p-2 mt-1 border rounded border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                required
                            >
                                <option value="Disponível">Disponível</option>
                                <option value="Em Manutenção">Em Manutenção</option>
                                <option value="Avariado">Avariado</option>
                                <option value="Alugado">Alugado</option>
                                {/* O backend associará isto ao EstadoVeiculoIDEstadoVeiculo */}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Foto do Veículo</label>
                            {/* Input de ficheiro estilizado minimamente */}
                            <label className="w-full flex items-center px-4 py-2 bg-white text-blue-500 rounded border border-gray-300 tracking-wide uppercase cursor-pointer hover:bg-blue-500 hover:text-white transition-colors duration-200 ease-in-out">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" />
                                </svg>
                                <span className="text-sm leading-normal truncate">{fileName || "Selecionar ficheiro..."}</span>
                                <input
                                    type='file'
                                    className="hidden" // Esconde o input default
                                    onChange={handleFileChange}
                                    accept="image/*" // Aceita apenas imagens
                                />
                            </label>
                        </div>
                    </div>


                    {/* Botões */}
                    <div className="flex justify-end gap-4 pt-6">
                        <Button text="Cancelar" variant="secondary" type="button" onClick={onClose} className="!py-1.5" />
                        <Button text="Confirmar" variant="primary" type="submit" className="!py-1.5" />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddVehicleModal;