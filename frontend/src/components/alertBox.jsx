import XIcon from '../assets/XIconBlack.svg';
import InfoIcon from '../assets/InfoIcon.svg'; // Adiciona este ícone manualmente
import Button from './button';

const InfoAlertBox = ({
                          title = "Título",
                          message = "Texto da mensagem.",
                          buttonText = "Confirmar",
                          onClose,
                          onAction,
                      }) => {
    return (
        <div className="flex flex-col gap-4 p-5 border border-gray-400 rounded-xl bg-white w-fit shadow-sm">

            {/* Top row: Info + Title + Close */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <img src={InfoIcon} alt="Info" className="w-6 h-6 mt-1" />
                    <div className="flex flex-col">
                        <h2 className="text-lg font-semibold text-black">{title}</h2>
                        <p className="text-gray-800">{message}</p>
                    </div>
                </div>

                <button onClick={onClose} className="w-5 h-5 mt-1 shrink-0" aria-label="Close">
                    <img src={XIcon} alt="Fechar" className="w-full h-full" />
                </button>
            </div>

            <div className="flex justify-start">
                <Button
                    text={buttonText}
                    variant="text"
                    onClick={onAction}
                    className="!py-0 "
                />
            </div>
        </div>
    );
};

export default InfoAlertBox;