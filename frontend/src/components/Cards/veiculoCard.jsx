
import Button from "../button.jsx";

const VeiculoCard = ({
                         CarroId,
                         CarroNome,
                         UltimaManutencao,
                         Estado,
                         imageUrl }) => {


    const onVerInfoClick = () => {
        console.log("Ver informação completa do carro:", CarroId);
        // Aqui você pode adicionar a lógica para redirecionar ou abrir um modal com mais informações
    }
    return (
        <div className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-5 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center gap-6">
                {/* imagem do carro ou placeholder*/}
                <div className="w-28 h-28 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={`Foto de ${CarroNome}`}
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
                <div className="flex-1 space-y-1">
                    <p className="text-base font-semibold text-slate-900">
                        Carro: <span className="font-normal">{CarroId}</span> &nbsp;&nbsp;
                        Carro: <span className="font-normal">{CarroNome}</span>
                    </p>
                    <p className="text-base font-semibold text-slate-900">
                        Última Manutenção: <span className="font-normal">{UltimaManutencao}</span>
                    </p>
                    <p className="text-base font-semibold text-slate-900">
                        Estado: <span className="font-normal">{Estado}</span>
                    </p>
                </div>
            </div>


            <div className="flex justify-end">
                <Button
                    text="Informação Completa"
                    variant="primary"
                    onClick={onVerInfoClick}
                    className="px-6 !py-1 text-base"
                />
            </div>
        </div>
    );
};

export default VeiculoCard;