import React from 'react';
import ClientHeader from '../../components/clientHeader.jsx';
import Footer from '../../components/footer.jsx';
import Button from '../../components/button.jsx'; // Import se precisar de botões
import { useNavigate } from 'react-router-dom';

// Componente para o cartão de parceiro (com placeholder de imagem)
const PartnerCard = ({ title, description, imageUrl = null }) => (
    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm text-left flex flex-col">
        {/* Placeholder para Imagem */}
        <div className="w-full h-32 bg-gray-200 rounded-md flex items-center justify-center mb-4">
            {imageUrl ? (
                <img src={imageUrl} alt={title} className="object-contain h-full w-full"/>
            ) : (
                <span className="text-gray-400 text-sm">Imagem</span>
            )}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm flex-grow">{description}</p>
    </div>
);

// Componente Principal da Página "Sobre Nós"
const SobreNosPage = () => {
    const navigate = useNavigate();

    // Dados de Exemplo (substituir pelos reais)
    const infoSections = [
        { title: "A Nossa Missão", text: "Facilitar o acesso a alugueres de veículos de forma simples, transparente e eficiente para todos os nossos clientes." },
        { title: "A Nossa Visão", text: "Ser a plataforma líder em Portugal para aluguer de veículos, conectando clientes e proprietários com confiança." },
        { title: "Os Nossos Valores", text: "Confiança, Transparência, Eficiência, Inovação e Foco no Cliente são os pilares da CarXpress." },
        { title: "A Nossa História", text: "Fundada em [Ano], a CarXpress nasceu da necessidade de modernizar o processo de aluguer de carros em Portugal." },
        { title: "Porquê Escolher-nos?", text: "Oferecemos uma vasta gama de veículos, preços competitivos e um suporte ao cliente dedicado para garantir a melhor experiência." },
    ];

    const partners = [
        { title: "Parceiro 1", description: "Breve descrição sobre a colaboração ou o que o Parceiro 1 faz." },
        { title: "Parceiro 2", description: "Breve descrição sobre a colaboração ou o que o Parceiro 2 faz." },
        { title: "Parceiro 3", description: "Breve descrição sobre a colaboração ou o que o Parceiro 3 faz." },
        { title: "Parceiro 4", description: "Breve descrição sobre a colaboração ou o que o Parceiro 4 faz." },
        { title: "Parceiro 5", description: "Breve descrição sobre a colaboração ou o que o Parceiro 5 faz." },
        { title: "Parceiro 6", description: "Breve descrição sobre a colaboração ou o que o Parceiro 6 faz." },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Assume-se que o ClientHeader pode lidar com userImage nulo */}
            <ClientHeader userImage={null} />

            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-5xl mx-auto">
                    {/* Título Principal */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            Sobre Nós
                        </h1>
                        <p className="text-lg text-gray-600">
                            Conheça mais sobre a CarXpress, a sua plataforma de aluguer de veículos.
                        </p>
                    </div>

                    {/* Secção 1: Blocos de Texto */}
                    <div className="mb-16">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-1 text-center">A CarXpress</h2>
                        <p className="text-md text-gray-500 mb-8 text-center">A nossa identidade e compromisso.</p>
                        <div className="space-y-4">
                            {infoSections.map((item, index) => (
                                <div key={index} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm text-left">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h3>
                                    <p className="text-gray-600 text-sm">{item.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Secção 2: Parceiros */}
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-1 text-center">Os nossos parceiros</h2>
                        <p className="text-md text-gray-500 mb-8 text-center">Colaboramos com os melhores para lhe oferecer mais.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {partners.map((partner, index) => (
                                <PartnerCard
                                    key={index}
                                    title={partner.title}
                                    description={partner.description}
                                    // imageUrl={partner.logoUrl} // Descomentar e usar quando tiver URLs reais
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default SobreNosPage;