import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ClientHeader from '../../components/clientHeader';
import Footer from '../../components/footer';
import Button from '../../components/button';
import { fetchWithAuth } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [aluguerId, setAluguerId] = useState(null);
    const [userImage, setUserImage] = useState(null);

    useEffect(() => {
        // Extract aluguerId from URL query parameters
        const params = new URLSearchParams(location.search);
        const id = params.get('aluguerId');
        if (id) {
            setAluguerId(id);
        }
    }, [location]);

    // Fetch user profile data when component mounts
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                // Fetch user profile data
                const profileData = await fetchWithAuth(`/api/clientes/me`);
                if (profileData?.imagemBase64) {
                    setUserImage(profileData.imagemBase64);
                }
            } catch (err) {
                console.error("Error fetching user profile:", err);
            }
        };

        if (user?.id) {
            fetchUserProfile();
        }
    }, [user?.id]);

    const handleViewProfile = () => {
        navigate('/user/profile');
    };

    const handleBackToShop = () => {
        navigate('/eShop');
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <ClientHeader userImage={userImage} />

            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto text-center">
                    <div className="mb-6">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Pagamento Bem-Sucedido!</h1>
                        <p className="text-gray-600">
                            O pagamento foi processado com sucesso. A taxa de reserva foi paga e o seu aluguer está confirmado.
                        </p>
                        {aluguerId && (
                            <p className="mt-2 text-gray-700">
                                Número de Aluguer: <span className="font-semibold">{aluguerId}</span>
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            text="Ver o meu Perfil"
                            variant="primary"
                            onClick={handleViewProfile}
                            className="w-full sm:w-auto"
                        />
                        <Button
                            text="Voltar à Loja"
                            variant="secondary"
                            onClick={handleBackToShop}
                            className="w-full sm:w-auto"
                        />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PaymentSuccess;
