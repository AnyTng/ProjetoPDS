import Button from "../button.jsx";

const ConcursosManutencaoAdminCard = ({
                      carroId,
                      carroNome,
                      estado,
                      TipoManutencao,
                      valor,
                      imageUrl,
                      concursoId,
                  }) => {
    const isFinalizado = estado === "aceite" || estado === "finalizado";
    const buttonLabel = isFinalizado ? "Ver Detalhes" : "Ver Propostas";
    const onButtonClick = () => {
        if (isFinalizado)
            console.log("blablablla ligar a api aqui filhos, para ir para os detalhes do concurso finalizado", concursoId);
        else
            console.log("blablablla ligar a api aqui filhos, para ir para os detalhes da proposta", concursoId)
    }

    return (
        <div className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-5 flex flex-col gap-4 shadow-sm">
            <div className="flex items-start gap-6">
                {/* Imagem vai aparecer aqui */}
                <div className="w-28 h-28 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={`Foto de ${carroNome}`}
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

                {/* Informações */}
                <div className="flex-1 grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
                    <div className="flex gap-2">
                        <span className="font-semibold text-slate-900">Carro:</span>
                        <span>{carroId}</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="font-semibold text-slate-900">Estado:</span>
                        <span>{estado}</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="font-semibold text-slate-900">Nome:</span>
                        <span>{carroNome}</span>
                    </div>
                    {isFinalizado && (
                        <div className="flex gap-2">
                            <span className="font-semibold text-slate-900">Valor:</span>
                            <span>{valor}</span>
                        </div>
                    )}
                    <div className="flex gap-2 col-span-2">
                        <span className="font-semibold text-slate-900">Tipo de Manutenção:</span>
                        <span>{TipoManutencao}</span>
                    </div>
                </div>
            </div>

            {/* Botão */}
            <div className="flex justify-end">
                <Button
                    text={buttonLabel}
                    variant="primary"
                    onClick={onButtonClick}
                    className="px-6 py-2 text-base"
                />
            </div>
        </div>
    );
};

export default ConcursosManutencaoAdminCard;