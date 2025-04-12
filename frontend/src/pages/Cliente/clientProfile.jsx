import { useState } from "react";
import ClientHeader from "../../components/clientHeader.jsx";
import ClientSidebarPanel from "../../components/clientSideBarPanel.jsx";
import InputFieldLong from "../../components/inputFieldLong.jsx";
import Button from "../../components/button.jsx";

const ClientProfile = ({ userImage, userData }) => {
    const [formData, setFormData] = useState(userData || []);

    const handleChange = (index, newValue) => {
        const updated = [...formData];
        updated[index].value = newValue;
        setFormData(updated);
    };

    const handleUpdate = () => {
        console.log("Atualizado:", formData);
        alert("Dados atualizados localmente!");
    };

    const handleDelete = () => {
        alert("Conta eliminada localmente!");
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <ClientHeader userImage={userImage} />

            <main className="max-w-7xl mx-auto p-6">
                <h2 className="text-gray-400 text-sm mb-4">Informação do Perfil</h2>

                <div className="bg-white rounded-xl shadow p-6 md:p-10 grid md:grid-cols-3 gap-8 min-h-[400px]">
                    {/* Painel Esquerdo Reutilizável */}
                    <ClientSidebarPanel
                        userImage={userImage}
                        userName={formData[0]?.value || "Utilizador"}
                        showDivider
                    />

                    {/* Painel Direito */}
                    <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {formData.map((item, i) => (
                            <div key={i}>
                                <label className="text-sm font-medium text-gray-700">
                                    {item.label}
                                </label>
                                <InputFieldLong
                                    type="text"
                                    placeholder={item.label}
                                    value={item.value}
                                    onChange={(e) => handleChange(i, e.target.value)}
                                />
                            </div>
                        ))}

                        <div className="flex gap-4 mt-4 col-span-full">
                            <Button
                                text="Eliminar Conta"
                                variant="danger"
                                onClick={handleDelete}
                                className="!py-1"
                            />
                            <Button
                                text="Atualizar Informação"
                                variant="primary"
                                onClick={handleUpdate}
                                className="!py-1"
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ClientProfile;