import { useContext } from 'react';
import { AuthContext } from '../contexts/authcontext';

// Custom hook para usar o AuthContext
export const useAuth = () => useContext(AuthContext);

// Exportação padrão para facilitar importações
export default useAuth;
