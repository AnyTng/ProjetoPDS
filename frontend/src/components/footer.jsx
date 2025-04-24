// src/components/Footer.jsx
import React from 'react';
import icon from '../assets/carXPressIcon.svg'

const Footer = () => {
    // Informações hardcoded (podes alterar estes valores)
    const morada = "Escritório Central CarXpress";
    const rua = "Rua das Ameixas";
    const codigoPostal = "1234-467, Frossos, Braga";
    const horario = "Seg-Sex: 9:00 - 18:00";
    const email = "geral@carxpress.pt";

    return (
        <footer className="bg-white border-t border-gray-200 px-6 sm:px-10 py-8 w-full mt-10"> {/* Adiciona margem superior se necessário */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-8">

                {/* Lado Esquerdo: Logo */}
                <div className="flex-shrink-0">
                    <img src={icon} alt="Logo CarXpress" className="h-8 w-auto"/>
                    {/* Espaço para Copyright ou outros links se quiseres adicionar no futuro */}
                    {/* <p className="text-xs text-gray-500 mt-4">&copy; 2025 CarXpress. Todos os direitos reservados.</p> */}
                </div>

                {/* Lado Direito: Informações de Contacto */}
                <div className="text-sm text-gray-700">
                    <h3 className="font-semibold text-gray-900 mb-3">Onde nos encontrar</h3>
                    <div className="space-y-1">
                        <p><span className="font-medium">Morada:</span> {morada}</p>
                        <p><span className="font-medium">Rua:</span> {rua}</p>
                        <p><span className="font-medium">Código Postal:</span> {codigoPostal}</p>
                        <p><span className="font-medium">Horário:</span> {horario}</p>
                        <p><span className="font-medium">Email:</span> <a href={`mailto:${email}`}
                                                                          className="text-blue-600 hover:underline">{email}</a>
                        </p>
                    </div>
                </div>


            </div>
        </footer>
    );
};

export default Footer;