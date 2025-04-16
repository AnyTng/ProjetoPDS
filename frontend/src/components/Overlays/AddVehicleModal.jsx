import React, { useState, useEffect } from "react";
import Button from "../button.jsx";
import InputFieldLong from "../inputFieldLong.jsx";
import XIcon from "../../assets/XIconBlack.svg";

const initialFormData = {
    matriculaVeiculo:    "",
    lotacaoVeiculo:      "",
    taraVeiculo:         "",
    descCor:             "",
    dataLegal:           "",
    dataFabricacao:      "",
    dataAquisicao:       "",
    valorDiarioVeiculo:  "",
    estadoVeiculo:       "",
    marcaVeiculoIdmarca: "",
    modeloVeiculoIdmodelo: ""
};

// ** Muda para a porta onde o teu ASP.NET Core está a correr **
const BACKEND_URL = "http://localhost:5159";

const AddVehicleModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState(initialFormData);
    const [brands, setBrands]     = useState([]);
    const [models, setModels]     = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileName, setFileName]         = useState("");

    /* ----------------------------------------------------------------
       Carrega marcas + modelos quando o modal abre
    ---------------------------------------------------------------- */
    useEffect(() => {
        if (!isOpen) return;
        fetch(`${BACKEND_URL}/api/MarcaVeiculos`)
            .then(r => r.ok && r.headers.get("content-type")?.includes("json")
                ? r.json() : Promise.reject("Não veio JSON"))
            .then(setBrands)
            .catch(err => console.error("Falha a carregar marcas:", err));
    }, [isOpen]);

    /* ----------------------------------------------------------------
       Filtra modelos quando muda a marca
    ---------------------------------------------------------------- */
    useEffect(() => {
        const marca = brands.find(b => b.idmarca === Number(formData.marcaVeiculoIdmarca));
        setModels(marca ? marca.modelos : []);
        setFormData(f => ({ ...f, modeloVeiculoIdmodelo: "" }));
    }, [formData.marcaVeiculoIdmarca, brands]);

    /* ----------------------------------------------------------------
       Handlers genéricos
    ---------------------------------------------------------------- */
    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(f => ({ ...f, [name]: value }));
    };

    const handleFileChange = e => {
        const file = e.target.files[0];
        setSelectedFile(file || null);
        setFileName(file ? file.name : "");
    };

    /* ----------------------------------------------------------------
       Submit
    ---------------------------------------------------------------- */
    const handleSubmit = e => {
        e.preventDefault();
        const dataToSend = new FormData();
        Object.entries(formData).forEach(([k, v]) => {
            if (v !== "" && v != null) dataToSend.append(k, v);
        });
        if (selectedFile) dataToSend.append("fotoVeiculo", selectedFile);
        onSubmit(dataToSend);
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                onClick={e => e.stopPropagation()}
                className="bg-white p-6 rounded-xl w-full max-w-3xl relative"
            >
                {/* Botão Fechar */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-6 h-6 text-gray-500 hover:text-gray-800"
                >
                    <img src={XIcon} alt="Fechar" className="w-full h-full" />
                </button>

                <h2 className="text-xl font-semibold mb-6 text-center">Adicionar Novo Veículo</h2>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* ---------- Marca / Modelo ---------- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="lbl">Marca</label>
                            <select
                                name="marcaVeiculoIdmarca"
                                value={formData.marcaVeiculoIdmarca}
                                onChange={handleChange}
                                className="input-select"
                                required
                            >
                                <option value="" disabled>Seleccione uma marca</option>
                                {brands.map(b => (
                                    <option key={b.idmarca} value={b.idmarca}>{b.descMarca}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="lbl">Modelo</label>
                            <select
                                name="modeloVeiculoIdmodelo"
                                value={formData.modeloVeiculoIdmodelo}
                                onChange={handleChange}
                                className="input-select"
                                required
                                disabled={!models.length}
                            >
                                <option value="" disabled>Seleccione um modelo</option>
                                {models.map(m => (
                                    <option key={m.idmodelo} value={m.idmodelo}>{m.descModelo}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* ---------- Linha 1 ---------- */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="lbl">Matrícula</label>
                            <InputFieldLong
                                type="text"
                                name="matriculaVeiculo"
                                value={formData.matriculaVeiculo}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="lbl">Lotação</label>
                            <InputFieldLong
                                type="number"
                                name="lotacaoVeiculo"
                                value={formData.lotacaoVeiculo}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="lbl">Tara (kg)</label>
                            <InputFieldLong
                                type="number"
                                name="taraVeiculo"
                                value={formData.taraVeiculo}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* ---------- Linha 2 ---------- */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="lbl">Cor</label>
                            <InputFieldLong
                                type="text"
                                name="descCor"
                                value={formData.descCor}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="lbl">Data Fabrico</label>
                            <InputFieldLong
                                type="date"
                                name="dataFabricacao"
                                value={formData.dataFabricacao}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="lbl">Data Legal</label>
                            <InputFieldLong
                                type="date"
                                name="dataLegal"
                                value={formData.dataLegal}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* ---------- Linha 3 ---------- */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="lbl">Data Aquisição</label>
                            <InputFieldLong
                                type="date"
                                name="dataAquisicao"
                                value={formData.dataAquisicao}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="lbl">Valor Diário (€)</label>
                            <InputFieldLong
                                type="number"
                                step="0.01"
                                name="valorDiarioVeiculo"
                                value={formData.valorDiarioVeiculo}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="lbl">Estado</label>
                            <select
                                name="estadoVeiculo"
                                value={formData.estadoVeiculo}
                                onChange={handleChange}
                                className="input-select"
                                required
                            >
                                <option value="" disabled>Seleccione estado</option>
                                <option value="Disponivel">Disponível</option>
                                <option value="Em Manutenção">Em Manutenção</option>
                                <option value="Avariado">Avariado</option>
                                <option value="Alugado">Alugado</option>
                            </select>
                        </div>
                    </div>

                    {/* ---------- Upload ---------- */}
                    <div>
                        <label className="lbl">Foto do Veículo</label>
                        <label className="input-file-label">
                            Escolher ficheiro…
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </label>
                        {fileName && <p className="mt-1 text-sm text-gray-600">{fileName}</p>}
                    </div>

                    {/* ---------- Botões ---------- */}
                    <div className="flex justify-end gap-4 pt-6">
                        <Button text="Cancelar" variant="secondary" type="button" onClick={onClose} />
                        <Button text="Adicionar" variant="primary" type="submit" />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddVehicleModal;