// src/stories/PesquisaCarFrame.stories.jsx
import React from 'react';
import PesquisaCarFrame from '../components/Cards/CarPesquisaFrame.jsx'; // Ajusta o caminho se necessário

// Mock de dados para os exemplos
const mockCarData = {
    Idveiculo: 1,
    MatriculaVeiculo: 'AA-BB-CC',
    LotacaoVeiculo: 5,
    TaraVeiculo: 1500,
    DescCor: 'Azul',
    DataFabricacao: '2022-01-15',
    DataAquisicao: '2023-03-10',
    ValorDiarioVeiculo: '75.50',
    CaminhoFotoVeiculo: 'https://via.placeholder.com/300/09f/fff.png&text=Carro+URL', // URL de exemplo
    ImagemBase64: null, // Deixar null para testar URL primeiro
    ModeloVeiculoIdmodelo: 10,
    MarcaVeiculoIdmarca: 5,
    DescModelo: 'Corolla',
    DescMarca: 'Toyota',
    DescVeiculo: 'Um carro fiável para o dia a dia.',
    EstadoVeiculo: 'Disponível',
    Avaliacao: 4.5,
    onClick: () => alert('Cartão clicado! ID: 1'), // Ação de exemplo
};

// Configuração base do Storybook
export default {
    title: 'Components/Cards/PesquisaCarFrame', // Organiza a story na barra lateral
    component: PesquisaCarFrame,
    // Adiciona decorators para melhor visualização, se necessário
    decorators: [
        (Story) => (
            // Limita a largura para simular como ficaria numa grelha
            <div style={{ maxWidth: '250px', margin: '2rem auto' }}>
                <Story />
            </div>
        ),
    ],
    argTypes: { // Opcional: Controlo interativo das props no Storybook
        ValorDiarioVeiculo: { control: 'text' },
        DescMarca: { control: 'text' },
        DescModelo: { control: 'text' },
        CaminhoFotoVeiculo: { control: 'text' },
        ImagemBase64: { control: 'text' },
        onClick: { action: 'clicked' }
    }
};

// Template base para as stories
const Template = (args) => <PesquisaCarFrame {...args} />;

// --- Variações da Story ---

// 1. Story com Imagem via URL
export const ComImagemURL = Template.bind({});
ComImagemURL.args = {
    ...mockCarData, // Usa os dados mock
};

// 2. Story com Imagem via Base64 (requer uma string Base64 válida)
export const ComImagemBase64 = Template.bind({});
ComImagemBase64.args = {
    ...mockCarData,
    CaminhoFotoVeiculo: null, // Ignora URL
    // Exemplo MUITO CURTO de Base64 - substitui por uma real se tiveres
    ImagemBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
    onClick: () => alert('Cartão Base64 clicado!'),
};

// 3. Story Sem Imagem (mostra o placeholder)
export const SemImagem = Template.bind({});
SemImagem.args = {
    ...mockCarData,
    CaminhoFotoVeiculo: null, // Sem URL
    ImagemBase64: null,       // Sem Base64
    DescMarca: 'Renault',
    DescModelo: 'Clio',
    ValorDiarioVeiculo: '55.00',
    onClick: () => alert('Cartão Sem Imagem clicado!'),
};

// 4. Story com Nome Mais Longo (testa o truncate)
export const NomeLongo = Template.bind({});
NomeLongo.args = {
    ...mockCarData,
    DescMarca: 'Mercedes-Benz',
    DescModelo: 'Classe C Station Wagon Avantgarde',
    ValorDiarioVeiculo: '120.00',
    CaminhoFotoVeiculo: 'https://via.placeholder.com/300/ff7f00/fff.png&text=Nome+Longo', // Outra imagem
    onClick: () => alert('Cartão Nome Longo clicado!'),
};

// 5. Story com Preço Zero ou Inválido
export const PrecoInvalido = Template.bind({});
PrecoInvalido.args = {
    ...mockCarData,
    DescMarca: 'Fiat',
    DescModelo: '500',
    ValorDiarioVeiculo: null, // Testa valor nulo
    CaminhoFotoVeiculo: null,
    ImagemBase64: null,
    onClick: () => alert('Cartão Preço Inválido clicado!'),
};