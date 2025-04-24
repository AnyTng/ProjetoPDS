// src/pages/LoggedOut/carShop.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ClientHeader from '../../components/clientHeader';
import Footer from '../../components/footer';
import Button from '../../components/button';
import { API_BASE_URL, fetchWithAuth } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';

const CarShop = () => {
    const { carID } = useParams(); // Get carID from URL parameter
    const navigate = useNavigate();
    const { user } = useAuth(); // Get user from auth context
    const [car, setCar] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userImage, setUserImage] = useState(null);


    // Update isLoggedIn state when user changes
    useEffect(() => {
        setIsLoggedIn(!!user);
    }, [user]);

    // Fetch user profile data when component mounts and user is logged in
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

    // Fetch car details when component mounts or carID changes
    useEffect(() => {
        const fetchCarDetails = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Endpoint to fetch a specific car by ID
                const response = await fetch(`${API_BASE_URL}/api/Veiculos/clienteVeiculo?id=${carID}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setCar(data);
            } catch (e) {
                console.error("Error fetching car details:", e);
                setError(e.message || "Could not load car details.");
            } finally {
                setIsLoading(false);
            }
        };

        if (carID) {
            fetchCarDetails();
        }
    }, [carID]);

    // Handle back to eShop button click
    const handleBackToEShop = () => {
        navigate('/eShop');
    };

    const handleCarRental = () => {
        if (!isLoggedIn) {
            // If user is not logged in, navigate to login page
            navigate('/login');
        } else {
            // If user is logged in, navigate to rent page
            navigate(`/eShop/rent/${carID}`);
        }
    }


    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <ClientHeader userImage={userImage} />

            <main className="flex-grow container mx-auto px-4 py-8">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <p className="text-gray-500">Loading car details...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col justify-center items-center h-64">
                        <p className="text-red-500 mb-4">{error}</p>
                        <Button
                            text="Voltar atrás"
                            variant="primary"
                            onClick={handleBackToEShop}
                        />
                    </div>
                ) : car ? (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-start mb-6">
                            <h1 className="text-2xl font-bold text-gray-800">
                                {car.veiculo.descMarca} {car.veiculo.descModelo}
                            </h1>
                            <Button
                                text="Voltar atrás"
                                variant="secondary"
                                onClick={handleBackToEShop}
                                className="!py-1.5 px-4 text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Car Image */}
                            <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                                {car.veiculo && car.veiculo.imagemBase64 ? (
                                    <img
                                        src={car.veiculo.imagemBase64}
                                        alt={`${car.veiculo.descMarca} ${car.veiculo.descModelo}`}
                                        className="max-h-full max-w-full object-contain"
                                    />
                                ) : (
                                    <p className="text-gray-500">No image available</p>
                                )}
                            </div>

                            {/* Car Details */}
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Mais sobre este carro</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-gray-600">Marca:</p>
                                        <p className="font-medium">{car.veiculo.descMarca}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Modelo:</p>
                                        <p className="font-medium">{car.veiculo.descModelo}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Ano:</p>
                                        <p className="font-medium">{new Date(car.veiculo.dataFabricacao).getFullYear()}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Cor:</p>
                                        <p className="font-medium">{car.veiculo.descCor}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Lugares:</p>
                                        <p className="font-medium">{car.veiculo.lotacaoVeiculo}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Taxa Diária:</p>
                                        <p className="font-medium text-green-600">{car.veiculo.valorDiarioVeiculo}€</p>
                                    </div>
                                </div>


                            </div>
                        </div>

                        {/* Additional Car Information */}
                        <div className="mt-8">
                            <h2 className="text-xl font-semibold mb-4">Informação Adicional</h2>
                            <p className="text-gray-700">
                                {car.veiculo.descVeiculo || 'Não há informação adicional disponível para este veículo.'}
                            </p>
                        </div>


                        {/* Rental Button */}
                        <div className="mt-8">
                            {!isLoggedIn ? (
                                <Button
                                    text="Por favor, faça login para alugar este carro"
                                    variant="secondary"
                                    onClick={handleCarRental}
                                    className="!w-full"
                                />
                            ) : car.veiculo.estadoVeiculo !== "Disponível" ? (
                                <Button
                                    text="Este carro está temporariamente indisponível"
                                    variant="secondary"
                                    disabled={true}
                                    className="!w-full opacity-70 cursor-not-allowed"
                                />
                            ) : (
                                <Button
                                    text="Alugar Este Carro"
                                    variant="primary"
                                    onClick={handleCarRental}
                                    className="!w-full"
                                />
                            )}
                        </div>


                        {/* Car Rating */}


                        <div className="mt-8 text-center">
                            <h1 className="text-3xl font-semibold text-gray-800 mb-4">
                                Avaliação deste carro
                            </h1>

                            {car.veiculo.avaliacao != null ? (
                                <div className="flex justify-center items-center gap-2">
                                    <span className="text-8xl font-bold">{car.veiculo.avaliacao}</span>
                                    <span className="text-4xl text-gray-600">/ 5</span>
                                </div>
                            ) : (
                                <p className="text-4xl text-gray-500 italic">*
                                    <span className="text-4xl text-gray-600"> / 5</span></p>
                            )}

                            <p className="text-gray-500 mt-2">
                                Baseado na experiência de outros utilizadores.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col justify-center items-center h-64">
                        <p className="text-gray-500 mb-4">Carro não encontrado</p>
                        <Button
                            text="Voltar atrás"
                            variant="primary"
                            onClick={handleBackToEShop}
                        />
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default CarShop;
