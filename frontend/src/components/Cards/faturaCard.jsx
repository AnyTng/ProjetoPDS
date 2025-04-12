import Button from "../button.jsx";

const FaturaCard = ({
                            Type,
                            CarId,
                            Valor,
                            FaturaId,
                            Data,
                            UserId,
                            Servico,
                        }) => {


    const handleTransferir = () => {
        console.log("Transferir Fatura", FaturaId);
        // EDITAR ISTOOOO
    };

    const isAluguer = Type?.toLowerCase() === "aluguer";
    const isServico = Type?.toLowerCase() === "servico";



    return (
        <div className="w-full bg-white border border-gray-200 rounded-xl px-8 py-6 flex flex-col gap-4 shadow-sm">
            <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
                <div className="flex gap-2">
                    <span className="font-semibold text-slate-900">Carro:</span>
                    <span>{CarId}</span>
                </div>

                {isServico && (
                    <div className="flex gap-2">
                        <span className="font-semibold text-slate-900">Serviço:</span>
                        <span>{Servico}</span>
                    </div>
                )}

                {isAluguer && (
                    <div className="flex gap-2">
                        <span className="font-semibold text-slate-900">ID Utilizador:</span>
                        <span>{UserId}</span>
                    </div>
                )}

                <div className="flex gap-2">
                    <span className="font-semibold text-slate-900">Data:</span>
                    <span>{Data}</span>
                </div>
                <div className="flex gap-2">
                    <span className="font-semibold text-slate-900">Valor:</span>
                    <span>{Valor}</span>
                </div>
                <div className="flex gap-2">
                    <span className="font-semibold text-slate-900">ID da Fatura:</span>
                    <span>{FaturaId}</span>
                </div>
            </div>





            <div className="flex justify-end gap-4 pt-4">
                <Button
                    text="Transferir Fatura"
                    variant="primary"
                    className="px-6 !py-1 text-base"
                    onClick={handleTransferir}
                />
            </div>
        </div>
    );
};

export default FaturaCard;