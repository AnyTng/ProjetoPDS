import Button from "../button.jsx";

const MultaCardAdmin = ({
                            multaId, // Need the ID for actions
                            AluguerId,
                            ClienteNome,
                            DataAtribuicao,
                            DataLimite,
                            DataPagamento,
                            Estado,
                            Contacto,
                            ContestacaoId,
                            Valor,
                            onEditClick, // Add prop
                            onViewContestationClick, // Add prop
                        }) => {
    const isPaga = Estado?.toLowerCase() === "paga";
    const isPendente = Estado?.toLowerCase() === "pendente";
    const temContestacao = !!ContestacaoId;

    // Use the props passed from the parent page
    const handleEditar = () => {
        if (onEditClick) {
            onEditClick(); // Call the function passed via prop
        } else {
            console.warn("onEditClick prop not provided to MultaCardAdmin");
        }
    };

    const handleVerContestacao = () => {
        if (onViewContestationClick) {
            onViewContestationClick(); // Call the function passed via prop
        } else {
            console.warn("onViewContestationClick prop not provided to MultaCardAdmin");
        }
    };

    // Format dates for display (optional but good practice)
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('pt-PT');
        } catch (e) {
            return dateString; // Return original if invalid
        }
    };


    return (
        <div className="w-full bg-white border border-gray-200 rounded-xl px-8 py-6 flex flex-col gap-4 shadow-sm">
            {/* Grid with fine details */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
                <div className="flex gap-2">
                    <span className="font-semibold text-slate-900 min-w-[110px]">ID Multa:</span>
                    <span>{multaId || 'N/A'}</span>
                </div>
                <div className="flex gap-2">
                    <span className="font-semibold text-slate-900 min-w-[110px]">ID Aluguer:</span>
                    <span>{AluguerId || 'N/A'}</span>
                </div>
                <div className="flex gap-2">
                    <span className="font-semibold text-slate-900 min-w-[110px]">Cliente:</span>
                    <span>{ClienteNome || 'N/A'}</span>
                </div>
                <div className="flex gap-2">
                    <span className="font-semibold text-slate-900 min-w-[110px]">Contacto Cliente:</span>
                    <span>{Contacto || 'N/A'}</span>
                </div>
                <div className="flex gap-2">
                    <span className="font-semibold text-slate-900 min-w-[110px]">Valor da Multa:</span>
                    {/* Ensure value is displayed correctly */}
                    <span>{Valor ? String(Valor).includes('€') ? Valor : `€${Number(Valor).toFixed(2)}` : 'N/A'}</span>
                </div>
                <div className="flex gap-2">
                    <span className="font-semibold text-slate-900 min-w-[110px]">Estado:</span>
                    <span>{Estado || 'N/A'}</span>
                </div>
                <div className="flex gap-2">
                    <span className="font-semibold text-slate-900 min-w-[110px]">Data de Atribuição:</span>
                    <span>{formatDate(DataAtribuicao)}</span>
                </div>

                {/* Conditionally display dates only if they exist */}
                {isPaga && DataPagamento && (
                    <div className="flex gap-2">
                        <span className="font-semibold text-slate-900 min-w-[110px]">Data de Pagamento:</span>
                        <span>{formatDate(DataPagamento)}</span>
                    </div>
                )}

                {isPendente && DataLimite && (
                    <div className="flex gap-2">
                        <span className="font-semibold text-slate-900 min-w-[110px]">Data Limite:</span>
                        <span>{formatDate(DataLimite)}</span>
                    </div>
                )}
                {temContestacao && (
                    <div className="flex gap-2">
                        <span className="font-semibold text-slate-900 min-w-[110px]">ID Contestação:</span>
                        <span>{ContestacaoId || 'N/A'}</span>
                    </div>
                )}
            </div>

            {/* Buttons Section */}
            <div className="flex justify-end gap-4 pt-4">
                <Button
                    text="Editar"
                    variant="text"
                    className="px-6 !py-1 text-base"
                    onClick={handleEditar}
                />
                {temContestacao && (
                    <Button
                        text="Ver Contestação"
                        variant="primary"
                        className="px-6 !py-1 text-base"
                        onClick={handleVerContestacao}
                    />
                )}
            </div>
        </div>
    );
};

export default MultaCardAdmin;