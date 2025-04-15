// srcFrontend/components/loginform.jsx
import { useState } from "react";
import InputFieldLong from "./inputFieldLong.jsx";
import Button from "./button.jsx";
import { useNavigate } from "react-router-dom";
import "../css/global.css";
import { useAuth } from "../hooks/useAuth";
import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = "http://localhost:5159";

// ****** FUNÇÃO AUXILIAR ATUALIZADA (pode ser removida se confiares 100% na roleName do AuthContext após o login) ******
const getRoleNameFromId = (roleId) => {
    const id = parseInt(roleId, 10);
    switch (id) {
        case 1: return 'cliente';
        case 2: return 'empresa';
        case 3: return 'admin';
        default: return 'desconhecido';
    }
};

const LoginForm = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/Auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: email, password: password })
            });

            if (!response.ok) {
                let errorMessage = `Erro ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.title || errorMessage;
                } catch { errorMessage = response.statusText || errorMessage; }
                if (response.status === 401 || response.status === 400) {
                    errorMessage = "Email ou palavra-passe inválidos.";
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();

            if (data.token) {
                login(data.token); // Passa o token para o contexto

                // Descodifica localmente SÓ para navegação imediata
                const decoded = jwtDecode(data.token);
                // ****** LÓGICA DE NAVEGAÇÃO ATUALIZADA ******
                // Obtém a roleName diretamente da claim 'role' se existir, senão usa o ID
                const roleNameClaim = decoded.role || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
                const roleIdClaim = decoded.roleId; // Usa a claim customizada com ID
                let roleNameToUse = roleNameClaim || getRoleNameFromId(roleIdClaim);

                console.log("Login successful, navigating based on role:", roleNameToUse);

                if (roleNameToUse === 'admin') { // ID 3
                    navigate("/admin/veiculos");
                } else if (roleNameToUse === 'cliente') { // ID 1
                    navigate("/user/profile");
                } else if (roleNameToUse === 'empresa') { // ID 2
                    navigate("/prestador/dashboard"); // Ajusta esta rota
                } else {
                    console.warn("Role desconhecida ou não mapeada:", roleNameToUse);
                    navigate("/");
                }

            } else {
                throw new Error("Token não recebido do servidor.");
            }

        } catch (err) {
            console.error("Erro no login:", err);
            setError(err.message || "Ocorreu um erro ao tentar iniciar sessão.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = () => {
        navigate("/registerUser");
    };

    // O JSX mantém-se igual ao da resposta anterior
    return (
        <div className={"outsideDiv"}>
            <h1 className="text-2xl font-bold text-center mb-6">Iniciar Sessão</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
                {error && <p className="text-red-500 text-sm text-center mb-2">{error}</p>}
                <div className="my-2">
                    <label htmlFor="email-login" className="sr-only">Email</label>
                    <InputFieldLong id="email-login" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} autoComplete="username"/>
                </div>
                <div className="my-2">
                    <label htmlFor="password-login" className="sr-only">Password</label>
                    <InputFieldLong id="password-login" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} autoComplete="current-password"/>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center w-full mt-4">
                    <Button text="Registar" variant="secondary" type="button" onClick={handleRegister} disabled={isLoading} className="flex-1"/>
                    <Button text={isLoading ? "A iniciar..." : "Iniciar Sessão"} variant="primary" type="submit" disabled={isLoading} className="flex-1"/>
                </div>
                <div className="text-center mt-4">
                    <Button text="É uma Empresa?" variant="text" type="button" disabled={isLoading} onClick={() => navigate('/registerEmpresa')} /> {/* Navega para registo empresa */}
                </div>
            </form>
        </div>
    );
};

export default LoginForm;