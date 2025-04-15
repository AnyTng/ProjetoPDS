// srcFrontend/contexts/authcontext.jsx
import { createContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();
const AUTH_TOKEN_KEY = 'authToken';

// Função auxiliar com o mapeamento correto: 1=cliente, 2=empresa, 3=admin
const getRoleNameFromId = (roleId) => {
    const id = parseInt(roleId, 10);
    switch (id) {
        case 1: return 'cliente';
        case 2: return 'empresa';
        case 3: return 'admin';
        default: return 'desconhecido';
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem(AUTH_TOKEN_KEY));
    const [loading, setLoading] = useState(true);

    // Função interna para descodificar e definir user (evita repetição)
    const processToken = (tokenToProcess) => {
        try {
            const decodedToken = jwtDecode(tokenToProcess);
            const currentTime = Date.now() / 1000;

            // Verifica expiração
            if (decodedToken.exp < currentTime) {
                console.warn("AuthContext: Token expirado.");
                return { user: null, token: null, expired: true };
            }

            // ****** LÓGICA DE EXTRAÇÃO DE ROLE CORRIGIDA ******
            // Tenta obter o nome da role diretamente da claim 'role' (standard) ou da claim completa URI
            const roleNameClaim = decodedToken.role || decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
            // Tenta obter o ID numérico da claim 'roleId' (custom)
            const roleIdClaim = decodedToken.roleId;

            console.log("AuthContext processToken - Decoded Claims:", { roleNameClaim, roleIdClaim, decodedToken }); // DEBUG

            let finalRoleId = roleIdClaim ? parseInt(roleIdClaim, 10) : 0;
            let finalRoleName = roleNameClaim || getRoleNameFromId(finalRoleId); // Usa nome da claim se existir, senão deriva do ID

            // Se o nome derivado for desconhecido mas a claim de nome existe, usa-a
            // E tenta inferir o ID a partir do nome correto se o ID não veio
            if (finalRoleName === 'desconhecido' && roleNameClaim) {
                finalRoleName = roleNameClaim;
                if (finalRoleId === 0) {
                    if (roleNameClaim === 'cliente') finalRoleId = 1;
                    else if (roleNameClaim === 'empresa') finalRoleId = 2;
                    else if (roleNameClaim === 'admin') finalRoleId = 3;
                }
            }

            if (finalRoleName === 'desconhecido') {
                console.warn("AuthContext processToken: Não foi possível determinar a role do utilizador a partir do token.", decodedToken);
            }

            const userData = {
                id: decodedToken.nameid || decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
                email: decodedToken.name || decodedToken.email || decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
                roleId: finalRoleId,
                roleName: finalRoleName,
            };

            return { user: userData, token: tokenToProcess, expired: false };

        } catch (error) {
            console.error("AuthContext processToken: Erro ao descodificar token.", error);
            return { user: null, token: null, expired: true }; // Assume inválido/expirado em caso de erro
        }
    };


    const initializeAuth = useCallback(() => {
        setLoading(true);
        const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
        if (storedToken) {
            const { user: processedUser, token: processedToken, expired } = processToken(storedToken);
            if (expired) {
                localStorage.removeItem(AUTH_TOKEN_KEY); // Remove se expirado
            }
            setUser(processedUser);
            setToken(processedToken); // Define null se expirado/inválido
        } else {
            setUser(null);
            setToken(null);
        }
        setLoading(false);
    }, []); // Sem dependências externas

    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    const login = useCallback((receivedToken) => {
        const { user: processedUser, token: processedToken, expired } = processToken(receivedToken);
        if (!expired && processedUser) {
            setUser(processedUser);
            setToken(processedToken);
            localStorage.setItem(AUTH_TOKEN_KEY, processedToken);
            setLoading(false); // Garante que não está loading
            console.log("AuthContext: Login processado com sucesso.");
        } else {
            console.error("AuthContext: Falha no login - token inválido ou expirado.");
            logout(); // Limpa tudo
        }
    }, []); // Adicionado 'logout' como dependência

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem(AUTH_TOKEN_KEY);
        setLoading(false);
        console.log("AuthContext: Logout efetuado.");
    }, []);

    const value = { user, token, loading, login, logout };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext };