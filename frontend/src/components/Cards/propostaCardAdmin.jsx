import Button from "../button.jsx";

const PropostaCardAdmin = ({
                               CarroId,
                               CarroNome,
                               EmpresaNome,
                               Data,
                               Valor,
                               TipoManutencao,
                               onAceitar,
                               onRejeitar,
                           }) => {
    return (
        <div className="w-full bg-white border border-gray-200 rounded-xl px-8 py-6 flex flex-col gap-4 shadow-sm">
            <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
                <div className="flex gap-2">
                    <span className="font-semibold text-slate-900">ID Carro:</span>
                    <span>{CarroId}</span>
                </div>
                <div className="flex gap-2">
                    <span className="font-semibold text-slate-900">Valor:</span>
                    <span>{Valor}</span>
                </div>

                <div className="flex gap-2">
                    <span className="font-semibold text-slate-900">Carro:</span>
                    <span>{CarroNome}</span>
                </div>
                <div className="flex gap-2">
                    <span className="font-semibold text-slate-900">Tipo de Manutenção:</span>
                    <span>{TipoManutencao}</span>
                </div>

                <div className="flex gap-2">
                    <span className="font-semibold text-slate-900">Empresa:</span>
                    <span>{EmpresaNome}</span>
                </div>
                <div className="flex gap-2">
                    <span className="font-semibold text-slate-900">Data:</span>
                    <span>{Data}</span>
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
                <Button
                    text="Rejeitar"
                    variant="text"
                    className="px-6 !py-1 text-base"
                    onClick={onRejeitar}
                />
                <Button
                    text="Aceitar"
                    variant="primary"
                    className="px-6 !py-1 text-base"
                    onClick={onAceitar}
                />
            </div>
        </div>
    );
};

export default PropostaCardAdmin;