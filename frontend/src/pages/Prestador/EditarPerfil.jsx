import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/dashboardLayout.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { fetchWithAuth } from "../../utils/api";
import Button from "../../components/button.jsx";

const EditarPerfilPrestador = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [formData, setFormData] = useState({
        funcionarioEmpresa: "",
        nomeEmpresa: "",
        nifEmpresa: "",
        ruaEmpresa: "",
        codigoPostalCp: "",
        loginIdlogin: "",
        contactoE1: "",
        contactoE2: ""
    });

    const fetchPerfil = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchWithAuth("/api/Empresas/me");
            setFormData({
                funcionarioEmpresa: data.funcionarioEmpresa || "",
                nomeEmpresa: data.nomeEmpresa || "",
                nifEmpresa: data.nifEmpresa || "",
                ruaEmpresa: data.ruaEmpresa || "",
                codigoPostalCp: data.codigoPostalCp || "",
                loginIdlogin: data.loginIdlogin || "",
                contactoE1: data.contactoE1 || "",
                contactoE2: data.contactoE2 || ""
            });
        } catch (err) {
            console.error("Erro ao buscar dados do perfil:", err);
            setError(err.message || "Não foi possível carregar os dados do perfil.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPerfil();
    }, [fetchPerfil]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            // Prepare data for API - match the expected format
            const updateData = {
                funcionarioEmpresa: formData.funcionarioEmpresa,
                ruaEmpresa: formData.ruaEmpresa,
                codigoPostal: formData.codigoPostalCp.toString(), // API expects codigoPostal for PUT
                contactoE1: parseInt(formData.contactoE1, 10),
                contactoE2: formData.contactoE2 ? parseInt(formData.contactoE2, 10) : null
            };

            await fetchWithAuth("/api/Empresas/me", {
                method: "PUT",
                body: updateData
            });

            setSuccessMessage("Perfil atualizado com sucesso!");
        } catch (err) {
            console.error("Erro ao atualizar perfil:", err);
            setError(err.message || "Não foi possível atualizar o perfil.");
        } finally {
            setIsLoading(false);
        }
    };

    let content;
    if (isLoading && !formData.funcionarioEmpresa) {
        content = <div className="p-6 text-center text-gray-500">A carregar dados do perfil…</div>;
    } else {
        content = (
            <div className="p-6">
                {error && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                        {successMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nome do Funcionário</label>
                            <input
                                type="text"
                                name="funcionarioEmpresa"
                                value={formData.funcionarioEmpresa}
                                onChange={handleChange}
                                className="mt-1 block w-full py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nome da Empresa</label>
                            <input
                                type="text"
                                name="nomeEmpresa"
                                value={formData.nomeEmpresa}
                                onChange={handleChange}
                                className="mt-1 block w-full py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                disabled={true}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">NIF</label>
                            <input
                                type="text"
                                name="nifEmpresa"
                                value={formData.nifEmpresa}
                                onChange={handleChange}
                                className="mt-1 block w-full py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                disabled={true} // NIF não pode ser alterado
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Rua</label>
                            <input
                                type="text"
                                name="ruaEmpresa"
                                value={formData.ruaEmpresa}
                                onChange={handleChange}
                                className="mt-1 block w-full py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Código Postal</label>
                            <input
                                type="text"
                                name="codigoPostalCp"
                                value={formData.codigoPostalCp}
                                onChange={handleChange}
                                className="mt-1 block w-full py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">ID de Login</label>
                            <input
                                type="text"
                                name="loginIdlogin"
                                value={formData.loginIdlogin}
                                onChange={handleChange}
                                className="mt-1 block py-3 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                disabled={true} // ID de login não pode ser alterado
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Contacto Principal</label>
                            <input
                                type="text"
                                name="contactoE1"
                                value={formData.contactoE1}
                                onChange={handleChange}
                                className="mt-1 block py-3 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Contacto Secundário</label>
                            <input
                                type="text"
                                name="contactoE2"
                                value={formData.contactoE2 || ""}
                                onChange={handleChange}
                                className="mt-1 block py-3 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            variant="primary"
                            text="Atualizar Perfil"
                            className="px-4 py-2 "
                            disabled={isLoading}
                            onClick={handleSubmit}
                        />
                    </div>
                </form>
            </div>
        );
    }

    return (
        <DashboardLayout
            title="Editar Perfil"
            email={user?.email}
        >
            {content}
        </DashboardLayout>
    );
};

export default EditarPerfilPrestador;
