import Button from "./button";

const MultaCardAdmin = ({
                            AluguerId,
                            ClienteNome,
                            DataAtribuicao,
                            DataLimite,
                            DataPagamento,
                            Estado,
                            Contacto,
                            ContestacaoId,
                            Valor,
                        }) => {
    const isPaga = Estado?.toLowerCase() === "paga";
    const isPendente = Estado?.toLowerCase() === "pendente";
    const temContestacao = !!ContestacaoId;

    const handleEditar = () => {
        console.log("Editar multa:", AluguerId);
        // EDITAR ISTOOOO
    };

    const handleVerContestacao = () => {
        console.log("Ver contestação:", ContestacaoId);
        // E ISTO TAMBEEMMM
    };

    return (
        <div className="w-full bg-white border border-gray-200 rounded-xl px-8 py-6 flex flex-col gap-4 shadow-sm">
            <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
                <div className="flex gap-2">
                    <span className="font-semibold text-slate-900">ID Aluguer:</span>
                    <span>{AluguerId}</span>
                </div>
                <div className="flex gap-2">
                    <span className="font-semibold text-slate-900">Cliente:</span>
                    <span>{ClienteNome}</span>
                </div>
                <div className="flex gap-2">
                    <span className="font-semibold text-slate-900">Contacto Cliente:</span>
                    <span>{Contacto}</span>
                </div>
                <div className="flex gap-2">
                    <span className="font-semibold text-slate-900">Valor da Multa:</span>
                    <span>{Valor}</span>
                </div>
                <div className="flex gap-2">
                    <span className="font-semibold text-slate-900">Estado:</span>
                    <span>{Estado}</span>
                </div>
                <div className="flex gap-2">
                    <span className="font-semibold text-slate-900">Data de Atribuição:</span>
                    <span>{DataAtribuicao}</span>
                </div>

                {isPaga && (
                    <div className="flex gap-2">
                        <span className="font-semibold text-slate-900">Data de Pagamento:</span>
                        <span>{DataPagamento}</span>
                    </div>
                )}

                {isPendente && (
                    <div className="flex gap-2">
                        <span className="font-semibold text-slate-900">Data Limite:</span>
                        <span>{DataLimite}</span>
                    </div>
                )}
            </div>

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