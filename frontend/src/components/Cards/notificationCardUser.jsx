import React from 'react';
import Button from '../button.jsx';

// --- Placeholder Icons ---
// Substitui 'WarningIcon.svg' e 'CheckIcon.svg' pelos caminhos reais dos teus SVGs
// Se não os tiveres, terás de os adicionar à pasta 'src/assets' (ou onde preferires)
import WarningIcon from '../../assets/WarningIcon.svg'; // Exemplo: Ícone para multa/aviso
import CheckIcon from '../../assets/CheckIcon.svg';   // Exemplo: Ícone para sucesso/confirmação

// --- Placeholder Image Icon ---
// Um SVG simples para usar quando não há imageUrl
const PlaceholderImageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);
// --- ---

const UserNotificationCard = ({ notificationData }) => {
    // Destructuring para fácil acesso. A API deve fornecer estes campos.
    const {
        id,                     // ID único da notificação
        type,                   // 'multa_atribuida', 'reserva_aceite', etc.
        title,                  // Título principal (ex: "Multa atribuída")
        details = {},           // Objeto com pares { label: valor } para a grelha
        imageUrl = null,        // URL da imagem (opcional)
        actions = [],           // Array de botões [{ label, variant, onClick }]
        // date,                // Data da notificação (pode ser incluída nos 'details' ou separada)
    } = notificationData || {}; // Default para objeto vazio se notificationData for null/undefined

    // Determina o ícone com base no tipo (podes expandir isto)
    let iconSrc;
    switch (type) {
        case 'multa_atribuida':
        case 'aviso': // Adicionar outros tipos de aviso aqui
            iconSrc = WarningIcon;
            break;
        case 'reserva_aceite':
        case 'pagamento_confirmado': // Adicionar outros tipos de sucesso aqui
            iconSrc = CheckIcon;
            break;
        default:
            iconSrc = null; // Ou um ícone default
    }

    // Separa os detalhes em duas colunas (aproximadamente)
    const detailKeys = Object.keys(details);
    const midIndex = Math.ceil(detailKeys.length / 2);
    const detailsCol1 = detailKeys.slice(0, midIndex);
    const detailsCol2 = detailKeys.slice(midIndex);

    if (!id) return null; // Não renderizar se não houver dados válidos

    return (
        <div className="w-full bg-white border border-gray-200 rounded-xl px-6 py-5 flex flex-col gap-4 shadow-sm">

            {/* Header: Icon + Title */}
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-3">
                {iconSrc && <img src={iconSrc} alt="" className="w-6 h-6 shrink-0" />}
                <h2 className="text-lg font-semibold text-slate-900">{title || 'Notificação'}</h2>
                {/* Opcional: Adicionar data da notificação aqui */}
                {/* {date && <span className="text-xs text-gray-500 ml-auto">{formatDate(date)}</span>} */}
            </div>

            {/* Content: Image + Details Grid */}
            <div className="flex items-start gap-6">
                {/* Image Placeholder */}
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center shrink-0 border">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt="Imagem da notificação" // Idealmente ter um alt text mais descritivo vindo da API
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.onerror = null; e.target.src = null; e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} // Fallback para o SVG
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center"> {/* Container para o SVG aparecer mesmo se onError for chamado */}
                            <PlaceholderImageIcon />
                        </div>
                    )}
                    {/* SVG como fallback caso a imagem falhe ou não exista (inicialmente escondido se imageUrl existir) */}
                    <div className={`w-full h-full items-center justify-center ${imageUrl ? 'hidden' : 'flex'}`}>
                        <PlaceholderImageIcon />
                    </div>
                </div>

                {/* Details Grid */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    {/* Coluna 1 */}
                    <div className="space-y-2">
                        {detailsCol1.map(key => (
                            <div key={key} className="flex gap-2">
                                <span className="font-semibold text-slate-800 min-w-[100px] capitalize">{key.replace(/_/g, ' ')}:</span>
                                <span className="text-slate-600">{details[key] ?? 'N/D'}</span>
                            </div>
                        ))}
                    </div>
                    {/* Coluna 2 */}
                    <div className="space-y-2">
                        {detailsCol2.map(key => (
                            <div key={key} className="flex gap-2">
                                <span className="font-semibold text-slate-800 min-w-[100px] capitalize">{key.replace(/_/g, ' ')}:</span>
                                <span className="text-slate-600">{details[key] ?? 'N/D'}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Actions */}
            {actions && actions.length > 0 && (
                <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 mt-3">
                    {actions.map((action, index) => (
                        <Button
                            key={index}
                            text={action.label}
                            variant={action.variant || 'primary'} // Default para primary se não especificado
                            onClick={() => action.onClick(id)} // Passa o ID da notificação para o handler
                            className="!py-1.5 px-4 text-sm" // Ajustar padding/tamanho se necessário
                            // Adicionar disabled se a API indicar
                            // disabled={action.disabled || false}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserNotificationCard;