import React, { useState, useEffect } from 'react';

const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') return '€0.00'; // Default para €0.00 se vazio
    const numericValue = Number(String(value).replace(/[^0-9.,]/g, '').replace(',', '.'));
    if (isNaN(numericValue)) return 'N/A';
    return `${numericValue.toFixed(2)}`;
};


const CarPesquisaFrame = ({
                              // Props que serão renderizadas:
                              ValorDiarioVeiculo,
                              CaminhoFotoVeiculo, // URL externo
                              ImagemBase64,       // String Base64
                              DescModelo,
                              DescMarca,


                              Idveiculo,
                              MatriculaVeiculo,
                              LotacaoVeiculo,
                              TaraVeiculo,
                              DescCor,
                              DataFabricacao,
                              DataAquisicao,
                              ModeloVeiculoIdmodelo,
                              MarcaVeiculoIdmarca,
                              DescVeiculo,
                              EstadoVeiculo,
                              Avaliacao,

                              // Prop para eventual clique no cartão
                              onClick,

                              // Props para animação
                              index = 0,
                              filterChangeKey = 0, // Chave que muda quando os filtros são alterados
                          }) => {
    // Estado para controlar a animação
    const [isVisible, setIsVisible] = useState(false);

    // Efeito para animar cada cartão com um atraso baseado no índice
    useEffect(() => {
        // Reset animation state when filterChangeKey changes
        setIsVisible(false);

        // Atraso base de 100ms + 50ms por índice para criar efeito escalonado
        const delay = 100 + (index * 50);

        const timer = setTimeout(() => {
            setIsVisible(true);
        }, delay);

        return () => clearTimeout(timer);
    }, [index, filterChangeKey]);

    // Determina a fonte da imagem
    let imageUrl = null;
    if (ImagemBase64) {
        // Ensure proper handling of base64 images
        imageUrl = ImagemBase64.startsWith('data:') ? ImagemBase64 : `data:image/jpeg;base64,${ImagemBase64}`;
    } else if (CaminhoFotoVeiculo) {
        imageUrl = CaminhoFotoVeiculo;
    }

    // Combina Marca e Modelo para o nome
    const vehicleName = `${DescMarca || ''} ${DescModelo || 'Veículo'}`.trim();

    // Classes CSS para a animação
    const animationClasses = isVisible
        ? "opacity-100 transform translate-y-0"
        : "opacity-0 transform translate-y-8";

    return (
        <div
            className={`w-full bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-500 ease-out cursor-pointer flex flex-col ${animationClasses}`}
            onClick={onClick} // Adiciona o handler de clique ao cartão inteiro
        >
            {/* Área da Imagem */}
            <div className="aspect-square w-full bg-gray-100 flex items-center justify-center overflow-hidden">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={vehicleName}
                        className="w-full h-full object-cover"
                        loading="lazy" // Opcional: melhora performance em listas longas
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <span className="text-gray-500 text-sm">Sem imagem</span>
                    </div>
                )}
            </div>

            {/* Área de Texto (Nome e Preço) */}
            <div className="p-3 text-left"> {/* Ajustado para text-left como na imagem */}
                <p className="text-sm font-medium text-gray-800 truncate" title={vehicleName}>
                    {vehicleName}
                </p>
                <p className="text-sm text-gray-600">
                    {formatCurrency(ValorDiarioVeiculo)}€ / dia
                </p>
            </div>
        </div>
    );
};

export default CarPesquisaFrame;
