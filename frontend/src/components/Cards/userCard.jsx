
import Button from "../button.jsx";

const UserCard = ({ userId, estado, nome, contacto, onVerInfoClick, imageUrl }) => {
    return (
        <div className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-5 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center gap-6">
                {/*aqui vai buscar uma imagem ou poe o placeholder se n existir */}
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

                {/* o texto lá do cartão */}
                <div className="flex-1 space-y-1">
                    <p className="text-base font-semibold text-slate-900">
                        User: <span className="font-normal">{userId}</span> &nbsp;&nbsp;
                        Estado: <span className="font-normal">{estado}</span>
                    </p>
                    <p className="text-base font-semibold text-slate-900">
                        Nome: <span className="font-normal">{nome}</span>
                    </p>
                    <p className="text-base font-semibold text-slate-900">
                        Contacto: <span className="font-normal">{contacto}</span>
                    </p>
                </div>
            </div>


            <div className="flex justify-end">
                <Button
                    text="Ver Informação Completa"
                    variant="primary"
                    onClick={onVerInfoClick}
                    className="px-6 py-2 text-base"
                />
            </div>
        </div>
    );
};

export default UserCard;