// srcFrontend/utils/api.js

// Define a URL base da tua API. Podes movê-la para um ficheiro .env mais tarde.
const API_BASE_URL = "http://localhost:5159";
const AUTH_TOKEN_KEY = 'authToken'; // Mesma chave usada no AuthContext

// Função para obter o token atual do localStorage
const getAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY);

/**
 * Função wrapper para fetch que adiciona automaticamente o token JWT
 * e trata de JSON e FormData.
 * @param {string} endpoint O endpoint da API (ex: '/api/users/me')
 * @param {object} options Opções do fetch (method, body, headers adicionais, etc.)
 * @returns {Promise<any>} A resposta da API (JSON descodificado ou null para No Content)
 * @throws {Error} Lança um erro em caso de falha na rede ou resposta não OK da API
 */
export const fetchWithAuth = async (endpoint, options = {}) => {
    const token = getAuthToken();
    const headers = {
        // Não definir Content-Type aqui por defeito, será feito abaixo
        ...options.headers, // Permite passar headers customizados
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    let finalBody = options.body;
    let contentTypeSet = false;

    // Se o body for FormData, o browser define o Content-Type correto (multipart/form-data)
    if (options.body instanceof FormData) {
        // Não adicionar Content-Type manualmente
        finalBody = options.body;
        contentTypeSet = true; // Indica que o tipo é tratado pelo FormData
    }
    // Se não for FormData e for um objeto (não string), assume JSON
    else if (options.body && typeof options.body === 'object') {
        headers['Content-Type'] = 'application/json';
        finalBody = JSON.stringify(options.body);
        contentTypeSet = true;
    }
    // Se for string, não define Content-Type (pode ser text/plain, etc.)
    else if (typeof options.body === 'string') {
        // Assume que o user pode querer definir Content-Type manualmente via options.headers
        if (!headers['Content-Type']) {
            console.warn(`WorkspaceWithAuth: Body é string mas Content-Type não foi definido nos headers para ${endpoint}. O browser pode usar um default.`);
        }
        finalBody = options.body;
        contentTypeSet = true;
    }

    // Se for GET ou HEAD, não precisa de Content-Type
    if (['GET', 'HEAD'].includes(options.method?.toUpperCase())) {
        contentTypeSet = true; // Não precisa de Content-Type
    }


    try {
        console.log(`WorkspaceWithAuth: ${options.method || 'GET'} ${API_BASE_URL}${endpoint}`); // Log da chamada
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
            body: finalBody,
        });

        // Tratamento da resposta
        if (!response.ok) {
            let errorData;
            try {
                // Tenta ler o corpo como JSON para obter mais detalhes do erro
                errorData = await response.json();
            } catch (e) {
                // Se falhar, usa o status text
                errorData = { message: response.statusText };
            }
            // Cria um erro mais informativo
            const error = new Error(
                errorData?.title || errorData?.message || `Erro ${response.status}`
            );
            error.status = response.status;
            error.data = errorData; // Adiciona dados extra do erro, se houver
            console.error(`API Error (${response.status}) for ${endpoint}:`, errorData);
            throw error; // Lança o erro para ser tratado no componente
        }

        // Verifica se há conteúdo para retornar
        const contentType = response.headers.get('content-type');
        if (response.status === 204 || !contentType) {
            return null; // Retorna null para 'No Content' ou sem tipo de conteúdo
        }

        if (contentType.includes('application/json')) {
            return await response.json(); // Retorna JSON descodificado
        }

        // Para outros tipos de conteúdo (ex: ficheiros, texto puro)
        // Poderias adicionar mais lógica aqui, por agora retorna a resposta crua
        console.warn(`WorkspaceWithAuth: Resposta não-JSON recebida de ${endpoint}. Retornando objeto Response.`);
        return response; // Ou response.text(), response.blob(), etc., conforme necessário

    } catch (error) {
        console.error(`Erro na chamada fetch para ${endpoint}:`, error);
        // Re-lança o erro para tratamento no componente que chamou
        throw error;
    }
};

// --- Exemplos de Uso (manter comentado ou remover) ---
/*
// GET (Simples)
fetchWithAuth('/api/some/data')
  .then(data => console.log(data))
  .catch(error => console.error(error));

// POST com JSON
fetchWithAuth('/api/some/resource', {
  method: 'POST',
  body: { name: 'Teste', value: 123 }
})
  .then(data => console.log(data))
  .catch(error => console.error(error));

// PUT com JSON
fetchWithAuth('/api/some/resource/1', {
  method: 'PUT',
  body: { name: 'Atualizado' }
})
  .then(data => console.log(data))
  .catch(error => console.error(error));

// DELETE
fetchWithAuth('/api/some/resource/1', { method: 'DELETE' })
  .then(() => console.log('Recurso apagado'))
  .catch(error => console.error(error));

// POST com FormData (Upload)
const myFormData = new FormData();
myFormData.append('description', 'Meu Ficheiro');
myFormData.append('file', fileInputElement.files[0]);

fetchWithAuth('/api/upload', {
  method: 'POST',
  body: myFormData // Passa o FormData diretamente
})
  .then(data => console.log(data))
  .catch(error => console.error(error));
*/