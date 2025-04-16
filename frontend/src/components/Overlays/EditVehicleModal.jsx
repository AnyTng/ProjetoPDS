// src/components/Overlays/EditVehicleModal.jsx
import React, { useState, useEffect } from "react";
import Button         from "../button.jsx";
import InputFieldLong from "../inputFieldLong.jsx";
import XIcon          from "../../assets/XIconBlack.svg";

const initialFormData = {
    // dropdowns
    marcaVeiculoIdmarca:   "",
    modeloVeiculoIdmodelo: "",

    // restantes campos
    matriculaVeiculo:      "",
    lotacaoVeiculo:        "",
    taraVeiculo:           "",
    descCor:               "",
    dataFabricacao:        "",
    dataLegal:             "",
    dataAquisicao:         "",
    valorDiarioVeiculo:    "",
    estadoVeiculo:         ""
};


// Ajusta para a porta/host do teu backend ou use proxy em package.json
const BACKEND_URL = "http://localhost:5159";

const EditVehicleModal = ({ isOpen, onClose, vehicleData, onUpdate, onDelete }) => {
    const [formData, setFormData]       = useState(initialFormData);
    const [brands, setBrands]           = useState([]);
    const [models, setModels]           = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileName, setFileName]         = useState("");
    const [currentImageUrl, setCurrentImageUrl] = useState("");

    console.log('Dentro do EditVehicleModal — vehicleData:', vehicleData);
    // 1) Busca marcas+modelos ao abrir
    useEffect(() => {
        if (!isOpen) return;
        fetch(`${BACKEND_URL}/api/MarcaVeiculos`)
            .then(r => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                const ct = r.headers.get("content-type") || "";
                if (!ct.includes("application/json")) throw new Error("Resposta não é JSON");
                return r.json();
            })
            .then(setBrands)
            .catch(err => console.error("Falha a carregar marcas:", err));
    }, [isOpen]);

    // 2) Quando vehicleData chega ou modal abre, preenche formData + imagem
    useEffect(() => {
        if (isOpen && vehicleData) {
            const fmt = d => d ? new Date(d).toISOString().split("T")[0] : "";

            setFormData({
                marcaVeiculoIdmarca:   (vehicleData.marcaVeiculoIdmarca ?? "").toString(),
                modeloVeiculoIdmodelo: (vehicleData.modeloVeiculoIdmodelo ?? "").toString(),

                matriculaVeiculo:      vehicleData.matriculaVeiculo || "",
                lotacaoVeiculo:        vehicleData.lotacaoVeiculo   || "",
                taraVeiculo:           vehicleData.taraVeiculo      || "",
                descCor:               vehicleData.descCor          || "",
                dataFabricacao:        fmt(vehicleData.dataFabricacao),
                dataLegal:             fmt(vehicleData.dataLegal),
                dataAquisicao:         fmt(vehicleData.dataAquisicao),
                valorDiarioVeiculo:    vehicleData.valorDiarioVeiculo?.toString() || "",
                estadoVeiculo:         vehicleData.estadoVeiculo    || ""
            });


            // preview da imagem:
            let img = vehicleData.imagemBase64 || "";
            // Se já vier com “data:image/…;base64,” deixamos passar
            if (img && !img.startsWith("data:")) {
                // senão prefixamos (ajusta para png/jpg conforme o teu backend)
                img = `data:image/png;base64,${img}`;
            }
            setCurrentImageUrl(
                img || vehicleData.caminhoFotoVeiculo || ""
            );

            setSelectedFile(null);
            setFileName("");
        } else {
            // …
        }
    }, [isOpen, vehicleData]);


    // 3) Filtra modelos sempre que muda a marca, mas só limpa se o modelo atual não existir
    useEffect(() => {
        const marca = brands.find(
            b => b.idmarca === Number(formData.marcaVeiculoIdmarca)
        );
        const modelosFiltrados = marca ? marca.modelos : [];
        setModels(modelosFiltrados);

        // Se tiver um modelo selecionado que NÃO está nos filtrados, limpa-o
        if (
            formData.modeloVeiculoIdmodelo &&
            !modelosFiltrados.some(
                m => m.idmodelo.toString() === formData.modeloVeiculoIdmodelo
            )
        ) {
            setFormData(fd => ({ ...fd, modeloVeiculoIdmodelo: "" }));
        }
    }, [formData.marcaVeiculoIdmarca, brands]);

    // Handlers genéricos
    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(fd => ({ ...fd, [name]: value }));
    };
    const handleFileChange = e => {
        const file = e.target.files[0];
        setSelectedFile(file || null);
        setFileName(file ? file.name : "");
        if (file) {
            setCurrentImageUrl(URL.createObjectURL(file));
        } else {
            setCurrentImageUrl(vehicleData.caminhoFotoVeiculo || "");
        }
    };


    // Submit (PUT)
    const handleUpdateSubmit = e => {
        e.preventDefault();
        const fd = new FormData();

        // 1) adiciona o ID do carro
        fd.append('Idveiculo', vehicleData.idveiculo.toString());

        // 2) adiciona marca e modelo (sempre)
        fd.append('marcaVeiculoIdmarca', formData.marcaVeiculoIdmarca);
        fd.append('modeloVeiculoIdmodelo', formData.modeloVeiculoIdmodelo);

        // 3) o resto dos campos genéricos
        Object.entries(formData).forEach(([k,v]) => {
            if (['Idveiculo','marcaVeiculoIdmarca','modeloVeiculoIdmodelo'].includes(k)) return;
            if (v !== '' && v != null) fd.append(k, v);
        });

        // 4) e o ficheiro com o nome do DTO
        if (selectedFile) {
            fd.append('ImagemVeiculo', selectedFile);
        }

        // finalmente envia
        onUpdate(fd);
    };

    useEffect(() => {
        if (isOpen && vehicleData && brands.length) {
            const marcaSelecionada = brands.find(
                b => b.idmarca === Number(vehicleData.marcaVeiculoIdmarca)
            );
            if (!marcaSelecionada) return;

            // ajusta a lista de modelos
            setModels(marcaSelecionada.modelos);

            // "re-seleciona" o modelo original
            setFormData(fd => ({
                ...fd,
                modeloVeiculoIdmodelo: (vehicleData.modeloVeiculoIdmodelo ?? "").toString()
            }));
        }
    }, [brands, isOpen, vehicleData]);

    // Delete
    const handleDeleteClick = () => {
        if (window.confirm(`Apagar veículo ${formData.matriculaVeiculo}?`)) {
            onDelete(vehicleData.idveiculo);
        }
    };

    if (!isOpen || !vehicleData) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white p-6 rounded-xl w-full max-w-3xl relative"
                onClick={e => e.stopPropagation()}
            >
                {/* Botão fechar */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-6 h-6 text-gray-500 hover:text-gray-800"
                >
                    <img src={XIcon} alt="Fechar" className="w-full h-full" />
                </button>

                <h2 className="text-xl font-semibold mb-6 text-center">Editar Veículo</h2>

                {/* Preview da imagem */}
                <div className="mb-4 flex justify-center">
                    <div className="w-40 h-40 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center border">
                        {currentImageUrl
                            ? <img src={currentImageUrl} alt="Preview" className="w-full h-full object-cover"/>
                            : <span className="text-gray-400">Sem imagem</span>
                        }
                    </div>


                </div>

                <form onSubmit={handleUpdateSubmit} className="space-y-4">

                    {/* Marca / Modelo */}
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
                                <option value="" disabled>Seleccione marca</option>
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
                                <option value="" disabled>Seleccione modelo</option>
                                {models.map(m => (
                                    <option key={m.idmodelo} value={m.idmodelo}>{m.descModelo}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Linha 1: Matrícula, Lotação, Tara */}
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

                    {/* Linha 2: Cor, Data Fabrico, Data Legal */}
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

                    {/* Linha 3: Data Aquisição, Valor Diário, Estado */}
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
                                <option value="Eliminado">Eliminado</option>
                            </select>
                        </div>
                    </div>

                    {/* Upload de foto */}
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

                    {/* Botões */}
                    <div className="flex justify-between items-center gap-4 pt-6">
                        
                        <div className="flex gap-4">
                            <Button text="Cancelar"  variant="secondary" onClick={onClose} />
                            <Button text="Guardar"   variant="primary"  type="submit" />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditVehicleModal;