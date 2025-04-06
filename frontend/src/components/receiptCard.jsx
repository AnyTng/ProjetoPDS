import Button from "./button";


const ReceiptCard = ({
                         tipo, // 'aluguer' ou 'servico'
                         carroId,
                         utilizador,
                         servicoPrestado,
                         data,
                         valor,
                         idFatura,
                         onDownloadClick
                     }) => {
    return (
        <div className="w-full max-w-4xl bg-white border border-gray-200 rounded-xl px-8 py-6 flex flex-col gap-4 shadow-sm">
            <div className="flex justify-between">
                <div className="space-y-2 text-left">
                    <p className="text-base font-semibold text-slate-900">
                        Carro: <span className="font-normal">{carroId}</span>
                    </p>

                    {tipo === "aluguer" ? (
                        <p className="text-base font-semibold text-slate-900">
                            Utilizador: <span className="font-normal">{utilizador}</span>
                        </p>
                    ) : (
                        <p className="text-base font-semibold text-slate-900">
                            Serviço Prestado: <span className="font-normal">{servicoPrestado}</span>
                        </p>
                    )}

                    <p className="text-base font-semibold text-slate-900">
                        Data: <span className="font-normal">{data}</span>
                    </p>
                </div>

                <div className="text-right space-y-2">
                    <p className="text-base font-semibold text-slate-900">
                        Valor: <span className="font-normal">{valor}</span>
                    </p>
                    <p className="text-base font-semibold text-slate-900">
                        ID: <span className="font-normal">{idFatura}</span>
                    </p>
                </div>
            </div>

            <Button
                text="Transferir Fatura"
                variant="primary"
                onClick={onDownloadClick}
                className="self-end px-6 py-2 text-base"
            />
        </div>
    );
};

export default ReceiptCard;
