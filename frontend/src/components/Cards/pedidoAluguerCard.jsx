import Button from "../button.jsx";

const PedidoAluguerCard = ({
                               userId,
                               carroId,
                               nome,
                               status,
                               startDate,
                               endDate,
                               value,
                               onVerInfoClick,
                               imageUrl,
                           }) => {
    return (
        <div className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-5 flex flex-col gap-4 shadow-sm">
            <div className="flex items-start gap-6">
                {/* Imagem */}
                <div className="w-28 h-28 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={`Foto de ${nome}`}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-12 h-12 text-gray-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4a4 4 0 110 8 4 4 0 010-8zM16 14H8a4 4 0 00-4 4v1h16v-1a4 4 0 00-4-4z"
                            />
                        </svg>
                    )}
                </div>

                {/* Informações em duas colunas de pares */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2 text-sm">
                    <div className="flex gap-2">
                        <span className="font-semibold text-slate-900 min-w-[80px]">Carro:</span>
                        <span className="text-slate-700">{carroId}</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="font-semibold text-slate-900 min-w-[80px]">Início:</span>
                        <span className="text-slate-700">{startDate}</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="font-semibold text-slate-900 min-w-[80px]">Fim:</span>
                        <span className="text-slate-700">{endDate}</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="font-semibold text-slate-900 min-w-[80px]">User:</span>
                        <span className="text-slate-700">{userId}</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="font-semibold text-slate-900 min-w-[80px]">Estado:</span>
                        <span className="text-slate-700">{status}</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="font-semibold text-slate-900 min-w-[80px]">Valor:</span>
                        <span className="text-slate-700">{value}</span>
                    </div>
                </div>
                </div>


            {/* Botão */}
            <div className="flex justify-end">
                <Button
                    text="Informação Completa"
                    variant="primary"
                    onClick={onVerInfoClick}
                    className="px-6 py-2 text-base"
                />
            </div>
        </div>
    );
};

export default PedidoAluguerCard;