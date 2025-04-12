// src/components/Cards/veiculoCard.jsx
import Button from "../button.jsx";

// Recebe onVerInfoClick como prop
const VeiculoCard = ({
                         CarroId,
                         CarroNome,
                         UltimaManutencao,
                         Estado,
                         imageUrl,
                         onVerInfoClick
                     }) => {

    return (
        <div className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-5 flex flex-col gap-4 shadow-sm">
            {/* ... (código da imagem e informações) ... */}
            <div className="flex items-center gap-6">
                {/* ... imagem ... */}
                <div className="w-28 h-28 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                    {/* ... svg/img ... */}
                    {imageUrl ? (
                        <img src={imageUrl} alt={`Foto de ${CarroNome}`} className="w-full h-full object-cover" />
                    ) : ( <svg/> /* placeholder */ )}
                </div>
                {/* ... informações ... */}
                <div className="flex-1 space-y-1">
                    <p className="text-base font-semibold text-slate-900">
                        Carro: <span className="font-normal">{CarroId}</span> &nbsp;&nbsp;
                        Nome: <span className="font-normal">{CarroNome}</span> {/* Ajustado para Nome em vez de repetir Carro */}
                    </p>
                    <p className="text-base font-semibold text-slate-900">
                        Última Manutenção: <span className="font-normal">{UltimaManutencao}</span>
                    </p>
                    <p className="text-base font-semibold text-slate-900">
                        Estado: <span className="font-normal">{Estado}</span>
                    </p>
                </div>
            </div>

            {/* Botão usa a prop diretamente */}
            <div className="flex justify-end">
                <Button
                    text="Informação Completa"
                    variant="primary"
                    onClick={onVerInfoClick} // <-- CORRETO: Chama a função passada por prop
                    className="px-6 !py-1 text-base"
                />
            </div>
        </div>
    );
};

export default VeiculoCard;