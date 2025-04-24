// src/pages/Cliente/AlugarCarroForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ClientHeader from '../../components/clientHeader';
import Footer from '../../components/footer';
import Button from '../../components/button';
import { API_BASE_URL, fetchWithAuth } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';

const AlugarCarroForm = () => {
    const { carID } = useParams(); // Get carID from URL parameter
    const navigate = useNavigate();
    const { user } = useAuth(); // Get user from auth context
    const [car, setCar] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pickupDate, setPickupDate] = useState('');
    const [returnDate, setReturnDate] = useState('');
    const [totalPrice, setTotalPrice] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');




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

    // Calculate the number of days between two dates
    const calculateDays = (start, end) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const timeDiff = endDate.getTime() - startDate.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return daysDiff > 0 ? daysDiff : 0;
    };

    // Calculate total price when dates change
    useEffect(() => {
        if (pickupDate && returnDate && car) {
            const days = calculateDays(pickupDate, returnDate);
            setTotalPrice(days * car.veiculo.valorDiarioVeiculo);
        } else {
            setTotalPrice(0);
        }
    }, [pickupDate, returnDate, car]);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!pickupDate || !returnDate) {
            setError('Por favor, selecione as datas de levantamento e entrega.');
            return;
        }

        if (new Date(pickupDate) >= new Date(returnDate)) {
            setError('A data de entrega deve ser posterior à data de levantamento.');
            return;
        }

        // Create dates at midnight for fair comparison
        const pickupDateTime = new Date(pickupDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (pickupDateTime < today) {
            setError('A data de levantamento não pode ser no passado.');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const queryParams = `?idVeiculo=${carID}&dataLevantamento=${pickupDate}&dataEntrega=${returnDate}`;
            const response = await fetchWithAuth(`/api/Alugueres/fazaluguer${queryParams}`, {
                method: 'POST'
            });

            // Check if response contains checkoutUrl
            if (response && response.checkoutUrl) {
                // Redirect to Stripe checkout
                window.location.href = response.checkoutUrl;
            } else {
                setError('Não foi possível obter o link de pagamento. Por favor, tente novamente.');
            }

        } catch (err) {
            setError(err.message || 'Ocorreu um erro ao processar o seu pedido.');
        } finally {
            setSubmitting(false);
        }
    };



    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <ClientHeader />

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
                                Alugar {car.veiculo.descMarca} {car.veiculo.descModelo}
                            </h1>
                            <Button
                                text="Voltar atrás"
                                variant="secondary"
                                onClick={handleBackToEShop}
                                className="!py-1.5 px-4 text-sm"
                            />
                        </div>

                        {successMessage && (
                            <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
                                {successMessage}
                            </div>
                        )}

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

                            {/* Car Details and Rental Form */}
                            <div>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <p className="text-gray-600">Marca:</p>
                                        <p className="font-medium">{car.veiculo.descMarca}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Modelo:</p>
                                        <p className="font-medium">{car.veiculo.descModelo}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Taxa Diária:</p>
                                        <p className="font-medium text-green-600">{car.veiculo.valorDiarioVeiculo}€</p>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="mt-6">
                                    <div className="mb-4">
                                        <label htmlFor="pickupDate" className="block text-gray-700 font-medium mb-2">
                                            Data de Levantamento
                                        </label>
                                        <input
                                            type="date"
                                            id="pickupDate"
                                            value={pickupDate}
                                            onChange={(e) => setPickupDate(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            min={new Date().toISOString().split('T')[0]}
                                            required
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label htmlFor="returnDate" className="block text-gray-700 font-medium mb-2">
                                            Data de Entrega
                                        </label>
                                        <input
                                            type="date"
                                            id="returnDate"
                                            value={returnDate}
                                            onChange={(e) => setReturnDate(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            min={pickupDate || new Date().toISOString().split('T')[0]}
                                            required
                                        />
                                    </div>

                                    {pickupDate && returnDate && totalPrice > 0 && (
                                        <div className="mb-6 p-4 bg-gray-100 rounded-lg">
                                            <p className="text-gray-700">Duração: {calculateDays(pickupDate, returnDate)} dias</p>
                                            <p className="text-gray-700">Reserva: {(totalPrice * 0.1).toFixed(2)}€</p>
                                            <p className="text-gray-700">Aluguer: {(totalPrice * 0.9).toFixed(2)}€</p>
                                            <p className="text-xl font-bold text-green-600">Preço Total: {totalPrice.toFixed(2)}€ </p>
                                            <p className="text-gray-700 font-ligh text-sm">(IVA Incluído a 23%€) </p>
                                        </div>
                                    )}

                                    <Button
                                        text={submitting ? "A processar..." : "Pagar a Taxa de Reserva"}
                                        variant="primary"
                                        type="submit"
                                        disabled={submitting || !pickupDate || !returnDate}
                                        className="!w-full mt-4"
                                    />
                                </form>
                            </div>
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

export default AlugarCarroForm;
