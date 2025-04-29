import React, { useState, useEffect, useMemo, useRef } from 'react';

// Custom CSS for range sliders
const rangeSliderStyles = `
  /* Styling for the slider track */
  .slider-container {
    position: relative;
    height: 40px;
    margin-top: 10px;
  }

  .slider-track {
    position: absolute;
    top: 18px;
    left: 0;
    right: 0;
    height: 4px;
    background-color: #e5e7eb;
    border-radius: 4px;
  }

  /* Styling for the slider thumbs */
  .range-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    background-color: #4f46e5;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    position: relative;
    z-index: 10;
  }

  .range-slider::-moz-range-thumb {
    width: 18px;
    height: 18px;
    background-color: #4f46e5;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    position: relative;
    z-index: 10;
  }

  /* Active state for thumbs */
  .range-slider::-webkit-slider-thumb:active {
    background-color: #6366f1;
    transform: scale(1.1);
  }

  .range-slider::-moz-range-thumb:active {
    background-color: #6366f1;
    transform: scale(1.1);
  }

  /* Hide the default track */
  .range-slider::-webkit-slider-runnable-track {
    background: transparent;
    height: 4px;
  }

  .range-slider::-moz-range-track {
    background: transparent;
    height: 4px;
  }
`;

// Componente auxiliar para uma secção de filtro com checkboxes
const CheckboxFilterSection = ({ title, options, selected, onChange }) => {
    const [isOpen, setIsOpen] = useState(true); // Secções abertas por defeito

    return (
        <div className="border-b border-gray-200 py-4">
            <button
                className="w-full flex justify-between items-center text-left font-medium text-gray-700 hover:text-gray-900"
                onClick={() => setIsOpen(!isOpen)}
            >
                {title}
                <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>
            {isOpen && (
                <div className="mt-3 space-y-2 max-h-40 overflow-y-auto pr-2">
                    {options.map(option => (
                        <label key={option} className="flex items-center text-sm text-gray-600">
                            <input
                                type="checkbox"
                                value={option}
                                checked={selected.includes(option)}
                                onChange={onChange}
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-2"
                            />
                            {option}
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};

// Componente principal da Sidebar
const FilterSidebar = ({ carsData = [], filters = {}, onFilterChange = () => {} }) => {

    // Extrair opções únicas dos dados dos carros (usando useMemo para eficiência)
    const filterOptions = useMemo(() => {
        const colors = [...new Set(carsData.map(car => car.descCor).filter(Boolean))].sort();
        const brands = [...new Set(carsData.map(car => car.descMarca).filter(Boolean))].sort();
        const years = [...new Set(carsData.map(car => new Date(car.dataFabricacao).getFullYear()).filter(y => !isNaN(y)))].sort((a, b) => b - a); // Mais recentes primeiro
        const seats = [...new Set(carsData.map(car => car.lotacaoVeiculo).filter(s => s > 0))].sort((a, b) => a - b);

        // Extrair e validar os preços
        const prices = carsData
            .map(car => parseFloat(car.valorDiarioVeiculo))
            .filter(p => p !== null && p !== undefined && !isNaN(p));

        // Definir preços mínimo e máximo com valores padrão seguros
        let minPrice = 0;
        let maxPrice = 1000; // Default max

        if (prices.length > 0) {
            minPrice = Math.floor(Math.min(...prices)); // Arredonda para baixo para garantir inclusão
            maxPrice = Math.ceil(Math.max(...prices)); // Arredonda para cima para garantir inclusão

            // Garantir que min e max são diferentes para evitar problemas com o slider
            if (minPrice === maxPrice) {
                maxPrice = minPrice + 100; // Adiciona um intervalo se os preços forem iguais
            }
        }

        return { colors, brands, years, seats, minPrice, maxPrice };
    }, [carsData]);

    // Handlers para atualizar o estado dos filtros no componente pai
    const handleCheckboxChange = (filterKey, event) => {
        const { value, checked } = event.target;
        const currentSelection = filters[filterKey] || [];
        const newSelection = checked
            ? [...currentSelection, value]
            : currentSelection.filter(item => item !== value);
        onFilterChange(filterKey, newSelection);
    };

    const handleDropdownChange = (filterKey, event) => {
        onFilterChange(filterKey, event.target.value);
    };

    const handlePriceChange = (key, value) => {
        // Validação básica para garantir que é número
        const numValue = value === '' ? '' : Number(value);
        if (value === '' || (!isNaN(numValue) && numValue >= 0)) {
            // Atualiza o objeto de preço mantendo o outro valor
            const currentPrice = filters.price || { min: '', max: '' };
            onFilterChange('price', { ...currentPrice, [key]: numValue });
        }
    };

    // Estado para controlar a exibição do tooltip
    const [showMinTooltip, setShowMinTooltip] = useState(false);
    const [showMaxTooltip, setShowMaxTooltip] = useState(false);

    // Referências para os sliders
    const minSliderRef = useRef(null);
    const maxSliderRef = useRef(null);

    // Função para atualizar os sliders e manter a relação entre eles
    const updateSliders = () => {
        if (minSliderRef.current && maxSliderRef.current) {
            // Garante que o slider min não ultrapasse o max
            if (Number(minSliderRef.current.value) > Number(maxSliderRef.current.value)) {
                minSliderRef.current.value = maxSliderRef.current.value;
            }

            // Garante que o slider max não seja menor que o min
            if (Number(maxSliderRef.current.value) < Number(minSliderRef.current.value)) {
                maxSliderRef.current.value = minSliderRef.current.value;
            }
        }
    };

    // Inicializa o filtro de preço com os valores min e max dos carros quando o componente monta ou quando filterOptions muda
    useEffect(() => {
        // Sempre define o filtro de preço com os valores min e max dos carros disponíveis
        if (filterOptions.minPrice !== undefined && filterOptions.maxPrice !== undefined) {
            // Inicializa o filtro de preço com os valores min e max dos carros
            onFilterChange('price', {
                min: filterOptions.minPrice,
                max: filterOptions.maxPrice
            });
        }
    }, [filterOptions.minPrice, filterOptions.maxPrice, onFilterChange]);


    return (
        <aside className="w-64 p-4 border-r border-gray-200 bg-white shadow-sm">
            {/* Apply custom styles for range sliders */}
            <style dangerouslySetInnerHTML={{ __html: rangeSliderStyles }} />

            <h3 className="text-lg font-semibold mb-4 text-gray-800">Filtra a tua pesquisa...</h3>

            {/* Filtro de Cor */}
            <CheckboxFilterSection
                title="Cor"
                options={filterOptions.colors}
                selected={filters.colors || []}
                onChange={(e) => handleCheckboxChange('colors', e)}
            />

            {/* Filtro de Marca */}
            <CheckboxFilterSection
                title="Marca"
                options={filterOptions.brands}
                selected={filters.brands || []}
                onChange={(e) => handleCheckboxChange('brands', e)}
            />

            {/* Filtro de Ano (Dropdown) */}
            <div className="border-b border-gray-200 py-4">
                <label htmlFor="year-filter" className="block font-medium text-gray-700 mb-2">Ano</label>
                <select
                    id="year-filter"
                    value={filters.year || ''}
                    onChange={(e) => handleDropdownChange('year', e)}
                    className="w-full p-2 border rounded border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                    <option value="">Todos os Anos</option>
                    {filterOptions.years.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>

            {/* Filtro de Preço (Double Range Slider) */}
            <div className="border-b border-gray-200 py-4">
                <span className="block font-medium text-gray-700 mb-2">Preço (€/dia)</span>

                {/* Double Range Slider */}
                <div className="mt-4 px-1 relative">
                    {/* Slider Container */}
                    <div className="slider-container">
                        {/* Slider Track */}
                        <div className="slider-track"></div>

                        {/* Min Slider */}
                        <input
                            ref={minSliderRef}
                            type="range"
                            min={filterOptions.minPrice}
                            max={filterOptions.maxPrice}
                            value={filters.price?.min ?? filterOptions.minPrice}
                            onChange={(e) => {
                                handlePriceChange('min', e.target.value);
                                updateSliders();
                            }}
                            onMouseEnter={() => setShowMinTooltip(true)}
                            onMouseLeave={() => setShowMinTooltip(false)}
                            onMouseDown={() => setShowMinTooltip(true)}
                            onMouseUp={() => setShowMinTooltip(false)}
                            className="absolute w-full h-1 cursor-pointer range-slider"
                            style={{
                                position: 'absolute',
                                top: '18px',
                                zIndex: 2,
                                WebkitAppearance: 'none',
                                appearance: 'none',
                                background: 'transparent',
                                pointerEvents: 'auto'
                            }}
                        />
                        {/* Min Tooltip */}
                        {showMinTooltip && (
                            <div
                                className="absolute px-2 py-1 bg-indigo-600 text-white text-xs rounded shadow"
                                style={{
                                    top: '0px',
                                    left: `calc(${((filters.price?.min ?? filterOptions.minPrice) - filterOptions.minPrice) / 
                                    (filterOptions.maxPrice - filterOptions.minPrice) * 100}% - 12px)`,
                                    zIndex: 3
                                }}
                            >
                                {filters.price?.min ?? filterOptions.minPrice}€
                            </div>
                        )}

                        {/* Max Slider */}
                        <input
                            ref={maxSliderRef}
                            type="range"
                            min={filterOptions.minPrice}
                            max={filterOptions.maxPrice}
                            value={filters.price?.max ?? filterOptions.maxPrice}
                            onChange={(e) => {
                                handlePriceChange('max', e.target.value);
                                updateSliders();
                            }}
                            onMouseEnter={() => setShowMaxTooltip(true)}
                            onMouseLeave={() => setShowMaxTooltip(false)}
                            onMouseDown={() => setShowMaxTooltip(true)}
                            onMouseUp={() => setShowMaxTooltip(false)}
                            className="absolute w-full h-1 cursor-pointer range-slider"
                            style={{
                                position: 'absolute',
                                top: '18px',
                                zIndex: 1,
                                WebkitAppearance: 'none',
                                appearance: 'none',
                                background: 'transparent',
                                pointerEvents: 'auto'
                            }}
                        />
                        {/* Max Tooltip */}
                        {showMaxTooltip && (
                            <div
                                className="absolute px-2 py-1 bg-indigo-600 text-white text-xs rounded shadow"
                                style={{
                                    top: '0px',
                                    left: `calc(${((filters.price?.max ?? filterOptions.maxPrice) - filterOptions.minPrice) / 
                                    (filterOptions.maxPrice - filterOptions.minPrice) * 100}% - 12px)`,
                                    zIndex: 3
                                }}
                            >
                                {filters.price?.max ?? filterOptions.maxPrice}€
                            </div>
                        )}
                    </div>

                    {/* Price Range Display */}
                    <div className="flex justify-between mt-2 text-sm text-gray-600">
                        <span>{filters.price?.min ?? filterOptions.minPrice}€</span>
                        <span>{filters.price?.max ?? filterOptions.maxPrice}€</span>
                    </div>
                </div>
            </div>


            {/* Filtro de Lugares */}
            <CheckboxFilterSection
                title="Lugares"
                options={filterOptions.seats.map(String)} // Converte para string para consistência
                selected={filters.seats || []}
                onChange={(e) => handleCheckboxChange('seats', e)}
            />

        </aside>
    );
};

export default FilterSidebar;
