import Button from "../button.jsx";

const UserCard = ({ userId, estado, nome, contacto, onVerInfoClick, imageUrl }) => {
    // Helper function to display the boolean status
    const getEstadoText = (estadoValue) => {
        return estadoValue === true ? "Válida" : estadoValue === false ? "Inválida" : "Desconhecido";
    };

    return (
        <div className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-5 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center gap-6">
                <div className="w-28 h-28 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                    {imageUrl ? (
                        <img
                            // Assuming imageUrl is the base64 string directly
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

                <div className="flex-1 space-y-1">
                    <p className="text-base font-semibold text-slate-900">
                        User ID: <span className="font-normal">{userId ?? 'N/A'}</span> &nbsp;&nbsp;
                        Estado CC: <span className={`font-normal ${estado === true ? 'text-green-600' : estado === false ? 'text-red-600' : 'text-gray-500'}`}>
                            {getEstadoText(estado)}
                        </span>
                    </p>
                    <p className="text-base font-semibold text-slate-900">
                        Nome: <span className="font-normal">{nome ?? 'N/A'}</span>
                    </p>
                    <p className="text-base font-semibold text-slate-900">
                        Contacto: <span className="font-normal">{contacto ?? 'N/A'}</span>
                    </p>
                </div>
            </div>

            <div className="flex justify-end">
                <Button
                    text="Ver Informação Completa"
                    variant="primary"
                    // Ensure onVerInfoClick receives the userId
                    onClick={() => onVerInfoClick(userId)}
                    className="px-6 py-2 text-base"
                />
            </div>
        </div>
    );
};

export default UserCard;