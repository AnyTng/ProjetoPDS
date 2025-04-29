import React, { useState } from 'react';
import ClientHeader from '../../components/clientHeader.jsx';
import Footer from '../../components/footer.jsx';
import Button from '../../components/button.jsx';
import { useNavigate } from 'react-router-dom';

// Componente Reutilizável para o Acordeão (FAQ)
const AccordionItem = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-gray-200 rounded-md mb-2 overflow-hidden">
            <button
                className="w-full flex justify-between items-center p-4 text-left bg-white hover:bg-gray-50 focus:outline-none"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="font-medium text-gray-800">{title}</span>
                {/* Ícone de Seta */}
                <svg
                    className={`w-5 h-5 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>
            {/* Conteúdo do Acordeão */}
            {isOpen && (
                <div className="p-4 bg-gray-50 border-t border-gray-200 text-gray-600 text-left">
                    {children}
                </div>
            )}
        </div>
    );
};


// Componente Principal da Página
const EmpresaManutencaoInfoPage = () => {
    const navigate = useNavigate();

    const handleFaleConnosco = () => {
        // Ação para o botão "Fale Connosco" - pode ser um mailto:, link para contacto, etc.
        console.log("Botão 'Fale Connosco' clicado.");
        // Exemplo: navigate('/contacto'); ou window.location.href = 'mailto:geral@carxpress.pt';
    };

    // Dados de Exemplo para os Benefícios e FAQ (substituir pelos reais)
    const beneficios = [
        { title: "Acesso a Novos Clientes", text: "Receba pedidos de manutenção de veículos da nossa vasta rede de utilizadores." },
        { title: "Gestão Simplificada", text: "Utilize a nossa plataforma para gerir propostas, agendamentos e faturas facilmente." },
        { title: "Processo Transparente", text: "Participe em concursos de manutenção com regras claras e comunicação direta." },
        { title: "Pagamentos Seguros", text: "Garantimos um processo de pagamento seguro e eficiente após a conclusão do serviço." },
        { title: "Visibilidade Aumentada", text: "Destaque a sua oficina e os seus serviços para mais potenciais clientes na sua área." },
    ];

    const faqs = [
        { q: "Como me registo como empresa de manutenção?", a: "O processo é simples. Clique no botão 'Registar Empresa' nesta página e siga os passos indicados no formulário." },
        { q: "Quais são os custos associados à plataforma?", a: "A utilização base da plataforma para receber e responder a concursos é gratuita. Poderão existir taxas associadas a serviços premium ou transações concluídas, que serão claramente comunicadas." },
        { q: "Como funciona o sistema de concursos?", a: "Empresas como a sua podem submeter propostas para pedidos de manutenção abertos. O administrador da plataforma seleciona a proposta vencedora com base em critérios como preço, tempo estimado e reputação." },
        { q: "Posso definir as minhas próprias tarifas?", a: "Sim, ao submeter uma proposta para um concurso, define o valor que considera justo para realizar o serviço descrito." },
        { q: "Como é feito o pagamento pelos serviços?", a: "Após a conclusão da manutenção e submissão da fatura (em formato PDF) através da plataforma, o pagamento será processado e transferido para a sua empresa." },
    ];


    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <ClientHeader userImage={null} />

            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-4xl mx-auto">
                    {/* Título Principal */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            Venha trabalhar Connosco
                        </h1>
                        <p className="text-lg text-gray-600">
                            Junte-se à rede de parceiros CarXpress e aumente a sua carteira de clientes.
                        </p>
                    </div>

                    {/* Secção de Benefícios */}
                    <div className="mb-16">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-1 text-center">Benefícios</h2>
                        <p className="text-md text-gray-500 mb-8 text-center">Descubra as vantagens de ser nosso parceiro.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {beneficios.slice(0, 5).map((item, index) => ( // Limita a 5 conforme design (ajustar se necessário)
                                <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm text-left">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                                    <p className="text-gray-600 text-sm">{item.text}</p>
                                </div>
                            ))}
                        </div>
                        {/* Botão de registo após os benefícios */}
                        <div className="text-center mt-10">
                            <Button
                                text="Registar Empresa Agora"
                                variant="primary"
                                onClick={() => navigate('/registerPrestador')}
                            />
                        </div>
                    </div>


                    {/* Secção FAQ */}
                    <div className="mb-16">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-1 text-center">FAQ</h2>
                        <p className="text-md text-gray-500 mb-8 text-center">Perguntas Frequentes</p>
                        <div>
                            {faqs.slice(0, 5).map((item, index) => ( // Limita a 5 conforme design
                                <AccordionItem key={index} title={item.q}>
                                    {item.a}
                                </AccordionItem>
                            ))}
                        </div>
                    </div>

                    {/* Secção CTA Final */}
                    <div className="text-center bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">
                            Ainda tem dúvidas?
                        </h3>
                        <Button
                            text="FALE CONNOSCO"
                            variant="secondary"
                            onClick={handleFaleConnosco}
                        />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default EmpresaManutencaoInfoPage;