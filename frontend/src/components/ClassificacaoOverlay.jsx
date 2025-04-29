import React, { useState, useEffect } from 'react';
import starEmpty from '../assets/starEmpty.svg';
import starFilled from '../assets/starFilled.svg';
import { fetchWithAuth } from '../utils/api';

const ClassificacaoOverlay = ({ isOpen, onClose, idAluguer, initialclassificacao = 0 }) => {
  const [classificacao, setclassificacao] = useState(initialclassificacao);
  const [hoveredclassificacao, setHoveredclassificacao] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Reset state when overlay opens
  useEffect(() => {
    if (isOpen) {
      setclassificacao(initialclassificacao);
      setHoveredclassificacao(0);
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, initialclassificacao]);

  // Handle classificacao submission
  const handleSubmit = async () => {
    if (classificacao === 0) {
      setError('Por favor, selecione uma classificação.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await fetchWithAuth(`/api/Alugueres/avaliacao?idAluguer=${idAluguer}&classificacao=${classificacao}`, {
        method: 'PUT'
      });

      setSuccess(true);
      setTimeout(() => {
        onClose(classificacao); // Close overlay and pass back the new classificacao
      }, 1500);
    } catch (err) {
      setError(err.message || 'Ocorreu um erro ao submeter a avaliação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle star hover
  const handleStarHover = (starValue) => {
    setHoveredclassificacao(starValue);
  };

  // Handle star click
  const handleStarClick = (starValue) => {
    setclassificacao(starValue);
  };

  // Render stars
  const renderStars = () => {
    const stars = [];
    const displayclassificacao = hoveredclassificacao || classificacao;

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <div 
          key={i}
          className={`transition-transform duration-200 ${displayclassificacao >= i ? 'scale-110' : 'scale-100'}`}
          onMouseEnter={() => handleStarHover(i)}
          onMouseLeave={() => handleStarHover(0)}
          onClick={() => handleStarClick(i)}
        >
          <img 
            src={displayclassificacao >= i ? starFilled : starEmpty}
            alt={`Star ${i}`} 
            className="w-16 h-16 cursor-pointer transition-all duration-300"
          />
        </div>
      );
    }
    return stars;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4 text-center relative animate-fadeIn">
        <button 
          onClick={() => onClose()} 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-bold mb-6">Avalie o seu aluguer</h2>

        <div className="flex justify-center space-x-2 mb-8">
          {renderStars()}
        </div>

        {error && (
          <div className="text-red-500 mb-4">{error}</div>
        )}

        {success ? (
          <div className="text-green-500 mb-4">Avaliação submetida com sucesso!</div>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              isSubmitting 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'A submeter...' : 'Submeter Avaliação'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ClassificacaoOverlay;
