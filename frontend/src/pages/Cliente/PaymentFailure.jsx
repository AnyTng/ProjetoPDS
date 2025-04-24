import React from 'react';
import { useNavigate } from 'react-router-dom';
import ClientHeader from '../../components/clientHeader';
import Footer from '../../components/footer';
import Button from '../../components/button';

const PaymentFailure = () => {
    const navigate = useNavigate();

    const handleTryAgain = () => {
        navigate('/eShop');
    };

    const handleViewProfile = () => {
        navigate('/user/profile');
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <ClientHeader />
            
            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto text-center">
                    <div className="mb-6">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Pagamento Não Concluído</h1>
                        <p className="text-gray-600">
                            Infelizmente, o seu pagamento não foi concluído com sucesso. Não se preocupe, nenhum valor foi cobrado.
                        </p>
                        <p className="mt-2 text-gray-600">
                            Pode tentar novamente ou contactar o nosso suporte se precisar de ajuda.
                        </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            text="Tentar Novamente"
                            variant="primary"
                            onClick={handleTryAgain}
                            className="w-full sm:w-auto"
                        />
                        <Button
                            text="Ver Meu Perfil"
                            variant="secondary"
                            onClick={handleViewProfile}
                            className="w-full sm:w-auto"
                        />
                    </div>
                </div>
            </main>
            
            <Footer />
        </div>
    );
};

export default PaymentFailure;