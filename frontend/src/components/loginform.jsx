// source/src/components/loginform.jsx
import { useState } from "react";
import InputFieldLong from "./inputFieldLong.jsx";
import Button from "./button.jsx";
import { useNavigate } from "react-router-dom";
import "../css/global.css";
import { useAuth } from "../hooks/useAuth";
// CORREÇÃO AQUI: Named import
import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = "http://localhost:5159";

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
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username: email, password: password })
            });

            if (!response.ok) {
                let errorMessage = `Erro ${response.status}: ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.title || errorMessage;
                } catch { /* Ignora */ }
                if (response.status === 401 || response.status === 400) {
                    errorMessage = "Email ou palavra-passe inválidos.";
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();

            if (data.token) {
                // CORREÇÃO AQUI: Usar jwtDecode
                const decodedToken = jwtDecode(data.token);
                console.log("Decoded Token:", decodedToken);

                const userData = {
                    token: data.token,
                    email: decodedToken.name,
                    id: decodedToken.nameid,
                    roleId: decodedToken.TipoLoginIDTLogin,
                    roleName: getRoleNameFromId(decodedToken.TipoLoginIDTLogin)
                };

                console.log("User Data to store:", userData);
                login(userData);

                if (userData.roleName === 'admin') {
                    navigate("/admin/veiculos");
                } else if (userData.roleName === 'cliente') {
                    navigate("/user/profile");
                } else if (userData.roleName === 'empresa') {
                    // navigate("/prestador/dashboard"); // Ajusta a rota
                } else {
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

    const getRoleNameFromId = (roleId) => {
        const id = parseInt(roleId, 10);
        switch (id) {
            case 1: return 'admin';
            case 2: return 'cliente';
            case 3: return 'empresa';
            default: return 'desconhecido';
        }
    };

    const handleRegister = () => {
        navigate("/registerUser");
    };

    return (
        <div className={"outsideDiv"}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
                {error && <p className="text-red-500 text-sm text-center mb-2">{error}</p>}

                <div className="my-2">
                    <InputFieldLong
                        id="email"
                        placeholder="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                </div>
                <div className="my-2">
                    <InputFieldLong
                        id="password"
                        placeholder="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                </div>

                <div className="flex gap-2 justify-center w-full mt-2">
                    <Button
                        text="Registar"
                        variant="secondary"
                        type="button"
                        style={{ flex: 1 }}
                        onClick={handleRegister}
                        disabled={isLoading}
                    />
                    <Button
                        text={isLoading ? "A iniciar..." : "Iniciar Sessão"}
                        variant="primary"
                        type="submit"
                        style={{ flex: 1 }}
                        disabled={isLoading}
                    />
                </div>
            </form>
        </div>
    );
};

export default LoginForm;