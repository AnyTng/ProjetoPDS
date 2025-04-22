// src/pages/LoggedOut/eShopPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
// import { fetchWithAuth } from '../../utils/api'; // Usar fetch normal se não precisar de auth
import ClientHeader from '../../components/clientHeader';
import Footer from '../../components/footer';
import FilterSidebar from '../../components/FilterSidebar';
import PesquisaCarFrame from '../../components/Cards/CarPesquisaFrame';
import FilterInput from '../../components/filterInput'; // Input de pesquisa geral
import Button from '../../components/button';


const API_BASE_URL = "http://localhost:5159"; // Ajusta se necessário

const EShopPage = () => {
    const [allCars, setAllCars] = useState([]); // Lista completa de carros da API
    const [filteredCars, setFilteredCars] = useState([]); // Lista após filtros e pesquisa
    const [filters, setFilters] = useState({}); // Estado dos filtros da sidebar
    const [searchTerm, setSearchTerm] = useState(''); // Estado da barra de pesquisa geral
    const [sortOption, setSortOption] = useState('new'); // Estado da ordenação
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterChangeKey, setFilterChangeKey] = useState(0); // Estado para controlar a animação dos cards

    // Função para buscar os carros (pode ser chamada na montagem e para refresh)
    const fetchCars = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Endpoint público para buscar todos os veículos disponíveis/listados
            const response = await fetch(`${API_BASE_URL}/api/Veiculos/clientePesquisaVeiculo`); // Assume um endpoint público
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setAllCars(Array.isArray(data) ? data : []);
            setFilteredCars(Array.isArray(data) ? data : []); // Inicialmente mostra todos
        } catch (e) {
            console.error("Erro ao buscar veículos:", e);
            setError(e.message || "Não foi possível carregar os veículos.");
            setAllCars([]);
            setFilteredCars([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Buscar carros na montagem inicial
    useEffect(() => {
        fetchCars();
    }, [fetchCars]);

    // Função para atualizar o estado dos filtros vindo da Sidebar
    const handleFilterChange = useCallback((filterKey, value) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            [filterKey]: value,
        }));
        // Incrementa a chave para resetar a animação dos cards
        setFilterChangeKey(prev => prev + 1);
    }, []);

    // Aplicar filtros, pesquisa e ordenação sempre que algo mudar
    useEffect(() => {
        let result = [...allCars];

        // 1. Aplicar Filtros da Sidebar
        Object.keys(filters).forEach(key => {
            const filterValue = filters[key];
            if (!filterValue) return; // Ignora filtros vazios/nulos

            if (key === 'colors' || key === 'brands' || key === 'seats') {
                // Filtros de checkbox (array)
                if (Array.isArray(filterValue) && filterValue.length > 0) {
                    result = result.filter(car => {
                        let carValue;
                        if (key === 'colors') carValue = car.descCor;
                        else if (key === 'brands') carValue = car.descMarca;
                        else if (key === 'seats') carValue = String(car.lotacaoVeiculo); // Compara como string
                        return carValue && filterValue.includes(carValue);
                    });
                }
            } else if (key === 'year') {
                // Filtro de ano (dropdown)
                if (filterValue !== '') {
                    result = result.filter(car => new Date(car.dataFabricacao).getFullYear() === parseInt(filterValue, 10));
                }
            } else if (key === 'price') {
                // Filtro de preço (min/max)
                const min = filterValue.min !== '' ? Number(filterValue.min) : -Infinity;
                const max = filterValue.max !== '' ? Number(filterValue.max) : Infinity;
                if (!isNaN(min) && !isNaN(max)) {
                    result = result.filter(car => {
                        const price = Number(car.valorDiarioVeiculo);
                        return !isNaN(price) && price >= min && price <= max;
                    });
                }
            }
        });

        // 2. Aplicar Pesquisa Geral (na marca, modelo, etc.)
        if (searchTerm.trim() !== '') {
            const lowerSearchTerm = searchTerm.toLowerCase();
            result = result.filter(car =>
                (car.descMarca?.toLowerCase() || '').includes(lowerSearchTerm) ||
                (car.descModelo?.toLowerCase() || '').includes(lowerSearchTerm) ||
                (car.descCor?.toLowerCase() || '').includes(lowerSearchTerm) ||
                (car.matriculaVeiculo?.toLowerCase() || '').includes(lowerSearchTerm) // Adicionar mais campos se necessário
            );
        }

        // 3. Aplicar Ordenação
        switch (sortOption) {
            case 'priceAscending':
                result.sort((a, b) => (Number(a.valorDiarioVeiculo) || 0) - (Number(b.valorDiarioVeiculo) || 0));
                break;
            case 'priceDescending':
                result.sort((a, b) => (Number(b.valorDiarioVeiculo) || 0) - (Number(a.valorDiarioVeiculo) || 0));
                break;
            case 'rating': // Assumindo 'avaliacao' como campo
                result.sort((a, b) => (Number(b.avaliacao) || 0) - (Number(a.avaliacao) || 0));
                break;
            case 'new': // Ordenar por ID ou data de aquisição (mais recentes primeiro)
            default:
                result.sort((a, b) => new Date(b.dataAquisicao || 0) - new Date(a.dataAquisicao || 0)); // Exemplo com data de aquisição
                break;
        }

        setFilteredCars(result);

    }, [allCars, filters, searchTerm, sortOption]);

    // Handler para clique no cartão (pode navegar para detalhes do carro)
    const handleCarClick = (carId) => {
        console.log("Clicou no carro ID:", carId);
        // navigate(`/car/${carId}`); // Exemplo de navegação
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <ClientHeader />

            <main className="flex-grow container mx-auto px-4 py-6 flex gap-6">
                {/* Sidebar de Filtros */}
                <FilterSidebar
                    carsData={allCars}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                />

                {/* Conteúdo Principal (Pesquisa, Ordenação e Grelha de Carros) */}
                <div className="flex-1">
                    {/* Barra de Pesquisa Geral e Ordenação */}
                    <div className="mb-4 p-4 bg-white rounded-lg shadow-sm flex flex-col sm:flex-row items-center gap-4">
                        <div className="flex-grow w-full sm:w-auto">
                            <FilterInput
                                placeholder="Pesquisa geral..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setFilterChangeKey(prev => prev + 1);
                                }}
                            />
                        </div>
                        <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
                            <span className="text-sm font-medium text-gray-600 hidden sm:inline">Ordenar por:</span>
                            {/* Botões de Ordenação (usar variant 'text' ou 'secondary' para inativos) */}
                            <Button text="Novos" variant={sortOption === 'new' ? 'primary' : 'text'} onClick={() => {setSortOption('new'); setFilterChangeKey(prev => prev + 1);}} className="!py-1 !px-2 !text-xs"/>
                            <Button text="Preço Asc" variant={sortOption === 'priceAscending' ? 'primary' : 'text'} onClick={() => {setSortOption('priceAscending'); setFilterChangeKey(prev => prev + 1);}} className="!py-1 !px-2 !text-xs"/>
                            <Button text="Preço Desc" variant={sortOption === 'priceDescending' ? 'primary' : 'text'} onClick={() => {setSortOption('priceDescending'); setFilterChangeKey(prev => prev + 1);}} className="!py-1 !px-2 !text-xs"/>
                            <Button text="Rating" variant={sortOption === 'rating' ? 'primary' : 'text'} onClick={() => {setSortOption('rating'); setFilterChangeKey(prev => prev + 1);}} className="!py-1 !px-2 !text-xs"/>
                        </div>
                    </div>

                    {/* Grelha de Carros */}
                    {isLoading ? (
                        <div className="text-center py-10 text-gray-500">A carregar carros...</div>
                    ) : error ? (
                        <div className="text-center py-10 text-red-600">Erro: {error}</div>
                    ) : filteredCars.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">Nenhum carro encontrado com os filtros selecionados.</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {filteredCars.map((car, index) => (
                                <PesquisaCarFrame
                                    key={car.idveiculo}
                                    Idveiculo={car.idveiculo}
                                    MatriculaVeiculo={car.matriculaVeiculo}
                                    LotacaoVeiculo={car.lotacaoVeiculo}
                                    TaraVeiculo={car.taraVeiculo}
                                    DescCor={car.descCor}
                                    DataFabricacao={car.dataFabricacao}
                                    DataAquisicao={car.dataAquisicao}
                                    ValorDiarioVeiculo={car.valorDiarioVeiculo}
                                    CaminhoFotoVeiculo={car.caminhoFotoVeiculo}
                                    ImagemBase64={car.imagemBase64}
                                    ModeloVeiculoIdmodelo={car.modeloVeiculoIdmodelo}
                                    MarcaVeiculoIdmarca={car.marcaVeiculoIdmarca}
                                    DescModelo={car.descModelo}
                                    DescMarca={car.descMarca}
                                    DescVeiculo={car.descVeiculo}
                                    EstadoVeiculo={car.estadoVeiculo}
                                    Avaliacao={car.avaliacao}
                                    onClick={() => handleCarClick(car.idveiculo)}
                                    index={index}
                                    filterChangeKey={filterChangeKey}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default EShopPage;
