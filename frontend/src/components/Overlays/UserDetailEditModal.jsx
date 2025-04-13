import React, { useState, useEffect } from 'react';
import Button from '../button.jsx';
import InputFieldLong from '../inputFieldLong.jsx';
import XIcon from '../../assets/XIconBlack.svg';

const initialFormData = {
    nome: '',
    dataNascimento: '',
    rua: '',
    codPostal: '',
    contacto1: '',
    contacto2: '',
    cartaConducaoNum: '',
    cartaConducaoValida: 'valida', // Default 'valida' ou ''? '' pode ser melhor
};

const UserDetailEditModal = ({ isOpen, onClose, onSubmit, userData, isLoading, error }) => {
    const [formData, setFormData] = useState(initialFormData);

    // Atualiza o formulário quando os dados do utilizador (userData) são carregados ou mudam
    useEffect(() => {
        if (userData) {
            setFormData({
                nome: userData.nome || '',
                // Formatar data para YYYY-MM-DD para o input type="date"
                dataNascimento: userData.dataNascimento ? new Date(userData.dataNascimento).toISOString().split('T')[0] : '',
                rua: userData.rua || '',
                codPostal: userData.codPostal || '',
                contacto1: userData.contacto1 || '',
                contacto2: userData.contacto2 || '',
                cartaConducaoNum: userData.cartaConducaoNum || '',
                // Ajustar com base em como a API retorna a validade (boolean ou string)
                cartaConducaoValida: userData.cartaConducaoValida === 'invalida' ? 'invalida' : 'valida',
                // Se API retornar boolean: userData.cartaConducaoValida ? 'valida' : 'invalida',
            });
        } else if (!isOpen) {
            // Reset form se fechar sem dados (caso raro, mas seguro)
            setFormData(initialFormData);
        }
        // Dependência em userData para preencher quando os dados chegarem
    }, [userData, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Adicionar validações se necessário
        if (!formData.nome || !formData.contacto1) {
            alert("Nome e Contacto 1 são obrigatórios.");
            return;
        }
        // Chama o onSubmit do pai, passando o ID original e os dados atualizados
        onSubmit(userData.id, formData);
    };

    // ----- Renderização -----
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-y-auto" // Permitir scroll
            onClick={onClose}
        >
            <div
                className="bg-white p-6 md:p-8 rounded-xl shadow-lg w-full max-w-3xl relative my-8" // Maior e com margem vertical
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
                    Detalhes e Edição do Utilizador #{userData?.id || '...'}
                </h2>

                {/* Mostrar Loading ou Erro dos Detalhes */}
                {isLoading && (
                    <div className="text-center p-10 text-gray-500">A carregar detalhes...</div>
                )}
                {error && !isLoading && (
                    <div className="text-center p-10 text-red-600">Erro ao carregar detalhes: {error}</div>
                )}

                {/* Mostrar Formulário apenas se não estiver a carregar, sem erro, e com dados */}
                {!isLoading && !error && userData && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Usar grid para melhor layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            {/* Coluna 1 */}
                            <div className='space-y-4'>
                                <div>
                                    <label className="lbl">Nome</label>
                                    <InputFieldLong name="nome" value={formData.nome} onChange={handleChange} required />
                                </div>
                                <div>
                                    <label className="lbl">Data de Nascimento</label>
                                    <InputFieldLong name="dataNascimento" type="date" value={formData.dataNascimento} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="lbl">Rua</label>
                                    <InputFieldLong name="rua" value={formData.rua} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="lbl">Código Postal</label>
                                    <InputFieldLong name="codPostal" value={formData.codPostal} onChange={handleChange} />
                                </div>
                            </div>

                            {/* Coluna 2 */}
                            <div className='space-y-4'>
                                <div>
                                    <label className="lbl">Contacto 1</label>
                                    <InputFieldLong name="contacto1" value={formData.contacto1} onChange={handleChange} required />
                                </div>
                                <div>
                                    <label className="lbl">Contacto 2</label>
                                    <InputFieldLong name="contacto2" value={formData.contacto2} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="lbl">Nº Carta de Condução</label>
                                    <InputFieldLong name="cartaConducaoNum" value={formData.cartaConducaoNum} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="lbl">Validade Carta Condução</label>
                                    <select
                                        name="cartaConducaoValida"
                                        value={formData.cartaConducaoValida}
                                        onChange={handleChange}
                                        className="input-select" // Reutilizar classe ou estilo
                                    >
                                        <option value="valida">Válida</option>
                                        <option value="invalida">Inválida</option>
                                        {/* Poderia ter 'nao_preenchido' ou similar se fizer sentido */}
                                        {/* <option value="">Não preenchido</option> */}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Botões */}
                        <div className="flex justify-end gap-4 pt-6">
                            <Button text="Cancelar" variant="secondary" type="button" onClick={onClose} className="!py-1.5" />
                            <Button text="Enviar Alterações" variant="primary" type="submit" className="!py-1.5" />
                        </div>
                    </form>
                )}

                {/* Botão de fechar caso só haja erro e não haja dados */}
                {!isLoading && error && !userData && (
                    <div className="flex justify-end pt-6">
                        <Button text="Fechar" variant="secondary" type="button" onClick={onClose} className="!py-1.5" />
                    </div>
                )}


                {/* Reutilizar estilos se definidos globalmente ou noutro modal */}
                <style jsx>{`
                    .lbl { display: block; text-sm: ; font-medium; color: #4a5568; margin-bottom: 0.25rem; }
                    .input-select { width: 100%; padding: 0.5rem; margin-top: 0.25rem; border-radius: 0.25rem; border: 1px solid #cbd5e0; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 0.5rem center; background-size: 1.5em 1.5em; padding-right: 2.5rem;}
                `}</style>
            </div>
        </div>
    );
};

export default UserDetailEditModal;