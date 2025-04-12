import React, { useState, useEffect } from 'react';
import Button from '../button.jsx';
import InputFieldLong from '../inputFieldLong.jsx';
import XIcon from '../../assets/XIconBlack.svg';

// Estado inicial vazio, será preenchido pelo useEffect
const initialFormData = {
    matriculaVeiculo: '',
    lotacaoVeiculo: '',
    taraVeiculo: '',
    descCor: '',
    dataLegal: '',
    dataFabricacao: '',
    dataAquisicao: '',
    valorDiarioVeiculo: '',
    marca: '',
    modelo: '',
    classeVeiculo: '',
    estadoVeiculo: '',
    combustivel: '',
    // A foto atual virá de vehicleData.imageUrl
};

const EditVehicleModal = ({ isOpen, onClose, vehicleData, onUpdate, onDelete }) => {
    const [formData, setFormData] = useState(initialFormData);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileName, setFileName] = useState("");
    const [currentImageUrl, setCurrentImageUrl] = useState(""); // Para mostrar a imagem atual

    // Preenche o formulário quando o modal abre ou os dados do veículo mudam
    useEffect(() => {
        if (isOpen && vehicleData) {
            // Mapeia os dados recebidos (vehicleData) para o estado do formulário (formData)
            // Garante que os nomes das propriedades coincidam ou faz a correspondência aqui
            setFormData({
                matriculaVeiculo: vehicleData.MatriculaVeiculo || vehicleData.matriculaVeiculo || '', // Adapta conforme a estrutura exata de vehicleData
                lotacaoVeiculo: vehicleData.LotacaoVeiculo || vehicleData.lotacaoVeiculo || '',
                taraVeiculo: vehicleData.TaraVeiculo || vehicleData.taraVeiculo || '',
                descCor: vehicleData.DescCor || vehicleData.descCor || '',
                // Formata as datas para YYYY-MM-DD se vierem noutro formato
                dataLegal: vehicleData.DataLegal ? new Date(vehicleData.DataLegal).toISOString().split('T')[0] : '',
                dataFabricacao: vehicleData.DataFabricacao ? new Date(vehicleData.DataFabricacao).toISOString().split('T')[0] : '',
                dataAquisicao: vehicleData.DataAquisicao ? new Date(vehicleData.DataAquisicao).toISOString().split('T')[0] : '',
                valorDiarioVeiculo: vehicleData.ValorDiarioVeiculo || vehicleData.valorDiarioVeiculo || '',
                marca: vehicleData.Marca || vehicleData.marca || '', // Supõe que estes campos existem em vehicleData
                modelo: vehicleData.Modelo || vehicleData.modelo || '',
                classeVeiculo: vehicleData.ClasseVeiculo || vehicleData.classeVeiculo || '',
                estadoVeiculo: vehicleData.EstadoVeiculo || vehicleData.estadoVeiculo || vehicleData.Estado || 'Disponível', // Adapta
                combustivel: vehicleData.Combustivel || vehicleData.combustivel || '',
            });
            setCurrentImageUrl(vehicleData.imageUrl || vehicleData.CaminhoFotoVeiculo || ""); // Adapta nome da prop da imagem
            setSelectedFile(null); // Reseta ficheiro selecionado
            setFileName("");
        } else {
            // Limpa o formulário se fechar ou não houver dados
            setFormData(initialFormData);
            setCurrentImageUrl("");
            setSelectedFile(null);
            setFileName("");
        }
    }, [isOpen, vehicleData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setFileName(file.name);
            setCurrentImageUrl(URL.createObjectURL(file)); // Mostra preview da nova imagem
        } else {
            setSelectedFile(null);
            setFileName("");
            // Volta a mostrar a imagem original se o user cancelar a seleção
            setCurrentImageUrl(vehicleData?.imageUrl || vehicleData?.CaminhoFotoVeiculo || "");
        }
    };

    // Handler para GUARDAR alterações
    const handleUpdateSubmit = (e) => {
        e.preventDefault();
        console.log("Updating vehicle data:", formData);
        console.log("New file selected:", selectedFile ? selectedFile.name : "None");

        // Lógica da API (PUT) virá aqui, usando FormData se houver ficheiro novo
        onUpdate(vehicleData.CarroId, formData, selectedFile); // Passa ID, dados, e novo ficheiro
    };

    // Handler para APAGAR veículo (com confirmação)
    const handleDeleteClick = () => {
        // Pede confirmação antes de apagar
        if (window.confirm(`Tem a certeza que deseja apagar o veículo ${formData.marca} ${formData.modelo} (${formData.matriculaVeiculo})? Esta ação é irreversível.`)) {
            console.log("Deleting vehicle ID:", vehicleData.CarroId); // Usa o ID original de vehicleData
            // Lógica da API (DELETE) virá aqui
            onDelete(vehicleData.CarroId); // Passa o ID original para a função onDelete do pai
        }
    };

    if (!isOpen || !vehicleData) return null; // Não renderiza se fechado ou sem dados

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 overflow-y-auto p-4"
            onClick={onClose}
        >
            <div
                className="bg-white p-6 md:p-8 rounded-xl shadow-lg w-full max-w-3xl relative my-8"
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
                    Editar Informação do Veículo
                </h2>

                {/* Mostra a imagem atual ou placeholder */}
                <div className="mb-4 flex justify-center">
                    <div className="w-40 h-40 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center shrink-0 border">
                        {currentImageUrl ? (
                            <img
                                src={currentImageUrl}
                                alt={`Foto de ${formData.marca} ${formData.modelo}`}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.onerror = null; e.target.src="placeholder_image_path.jpg"}} // Adiciona um placeholder se a imagem falhar
                            />
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        )}
                    </div>
                </div>

                <form onSubmit={handleUpdateSubmit} className="space-y-4">
                    {/* Campos do formulário (iguais ao AddVehicleModal, mas preenchidos) */}
                    {/* Linha: Marca, Modelo, Matrícula */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><label className="lbl">Marca</label><InputFieldLong type="text" name="marca" value={formData.marca} onChange={handleChange} required /></div>
                        <div><label className="lbl">Modelo</label><InputFieldLong type="text" name="modelo" value={formData.modelo} onChange={handleChange} required /></div>
                        <div><label className="lbl">Matrícula</label><InputFieldLong type="text" name="matriculaVeiculo" value={formData.matriculaVeiculo} onChange={handleChange} required /></div>
                    </div>
                    {/* Linha: Lotação, Tara, Cor */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><label className="lbl">Lotação</label><InputFieldLong type="number" name="lotacaoVeiculo" value={formData.lotacaoVeiculo} onChange={handleChange} required /></div>
                        <div><label className="lbl">Tara (kg)</label><InputFieldLong type="number" name="taraVeiculo" value={formData.taraVeiculo} onChange={handleChange} /></div>
                        <div><label className="lbl">Cor</label><InputFieldLong type="text" name="descCor" value={formData.descCor} onChange={handleChange} required /></div>
                    </div>
                    {/* Linha: Data Fabrico, Data Legal, Data Aquisição */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><label className="lbl">Data Fabrico</label><InputFieldLong type="date" name="dataFabricacao" value={formData.dataFabricacao} onChange={handleChange} required /></div>
                        <div><label className="lbl">Data Legal</label><InputFieldLong type="date" name="dataLegal" value={formData.dataLegal} onChange={handleChange} /></div>
                        <div><label className="lbl">Data Aquisição</label><InputFieldLong type="date" name="dataAquisicao" value={formData.dataAquisicao} onChange={handleChange} required /></div>
                    </div>
                    {/* Linha: Valor Diário, Classe, Combustível */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><label className="lbl">Valor Diário (€)</label><InputFieldLong type="number" step="0.01" name="valorDiarioVeiculo" value={formData.valorDiarioVeiculo} onChange={handleChange} required /></div>
                        <div><label className="lbl">Classe</label><InputFieldLong type="text" name="classeVeiculo" value={formData.classeVeiculo} onChange={handleChange} required /></div>
                        <div><label className="lbl">Combustível</label><InputFieldLong type="text" name="combustivel" value={formData.combustivel} onChange={handleChange} required /></div>
                    </div>
                    {/* Linha: Estado, Foto */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                        <div>
                            <label className="lbl">Estado</label>
                            <select name="estadoVeiculo" value={formData.estadoVeiculo} onChange={handleChange} className="input-select" required>
                                <option value="Disponível">Disponível</option>
                                <option value="Em Manutenção">Em Manutenção</option>
                                <option value="Avariado">Avariado</option>
                                <option value="Alugado">Alugado</option>
                            </select>
                        </div>
                        <div>
                            <label className="lbl">Substituir Foto</label>
                            <label className="input-file-label">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" /></svg>
                                <span className="truncate">{fileName || "Escolher novo ficheiro..."}</span>
                                <input type='file' className="hidden" onChange={handleFileChange} accept="image/*" />
                            </label>
                        </div>
                    </div>

                    {/* Botões */}
                    <div className="flex justify-between items-center gap-4 pt-6">
                        {/* Botão Apagar à esquerda */}
                        <Button
                            text="Apagar Veículo"
                            variant="danger" // Botão de perigo
                            type="button"
                            onClick={handleDeleteClick}
                            className="!py-1.5"
                        />
                        {/* Botões Cancelar e Guardar à direita */}
                        <div className="flex gap-4">
                            <Button text="Cancelar" variant="secondary" type="button" onClick={onClose} className="!py-1.5" />
                            <Button text="Guardar Alterações" variant="primary" type="submit" className="!py-1.5" />
                        </div>
                    </div>
                </form>
            </div>
            {/* Adicionar alguns estilos reutilizáveis */}
            <style jsx>{`
                .lbl { display: block; text-sm: ; font-medium; color: #4a5568; margin-bottom: 0.25rem; }
                .input-select { width: 100%; padding: 0.5rem; margin-top: 0.25rem; border-radius: 0.25rem; border: 1px solid #cbd5e0; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 0.5rem center; background-size: 1.5em 1.5em; padding-right: 2.5rem;}
                .input-file-label { display: flex; width: 100%; align-items: center; padding: 0.5rem 1rem; background-color: white; color: #4299e1; border-radius: 0.25rem; border: 1px solid #cbd5e0; letter-spacing: 0.025em; text-transform: uppercase; cursor: pointer; transition: all 0.15s ease-in-out; }
                .input-file-label:hover { background-color: #4299e1; color: white; }
            `}</style>
        </div>
    );
};

export default EditVehicleModal;