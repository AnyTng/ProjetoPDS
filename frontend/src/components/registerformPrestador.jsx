import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputFieldLong from "./inputFieldLong.jsx";
import Button from "./button.jsx";
import "../css/global.css";
import { useAuth } from "../hooks/useAuth";
import { jwtDecode } from 'jwt-decode';
import { API_BASE_URL } from "../utils/api";

const validateCodigoPostal = (cp) => {
    if (!cp) return false;
    const cpDigits = cp.replace(/\D/g, '');
    return /^\d{7}$/.test(cpDigits);
};

const RegisterFormPrestador = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    // Estados para o formulário de prestador
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [funcionarioEmpresa, setFuncionarioEmpresa] = useState("");
    const [nomeEmpresa, setNomeEmpresa] = useState("");
    const [nifEmpresa, setNifEmpresa] = useState("");
    const [ruaEmpresa, setRuaEmpresa] = useState("");
    const [codigoPostal, setCodigoPostal] = useState("");
    const [localidade] = "placeholder";
    const [contactoE1, setContactoE1] = useState("");
    const [contactoE2, setContactoE2] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        // Validações Frontend
        if (password !== confirmPassword) {
            setError("As palavras-passe não coincidem.");
            setIsLoading(false);
            return;
        }
        if (!validateCodigoPostal(codigoPostal)) {
            setError("Formato inválido para Código Postal (Ex: 1234-567 ou 1234567).");
            setIsLoading(false);
            return;
        }
        if (!/^\d{9}$/.test(nifEmpresa)) {
            setError("NIF inválido. Deve ter exatamente 9 dígitos.");
            setIsLoading(false);
            return;
        }
        if (!/^\d{9}$/.test(contactoE1)) {
            setError("Contacto principal da empresa inválido. Deve ter exatamente 9 dígitos.");
            setIsLoading(false);
            return;
        }
        if (contactoE2 && !/^\d{9}$/.test(contactoE2)) {
            setError("Contacto secundário da empresa inválido. Deve ter 9 dígitos.");
            setIsLoading(false);
            return;
        }

        let authToken = null;

        try {
            // Passo 1: Registar Login com tipo 3 (conforme solicitado)
            const TIPO_LOGIN_PRESTADOR = 2;
            const registerResponse = await fetch(`${API_BASE_URL}/api/Auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: email,
                    password: password,
                    tipoLoginIDTLogin: TIPO_LOGIN_PRESTADOR
                })
            });

            if (!registerResponse.ok) {
                let errMsg = `Erro ${registerResponse.status} ao criar login.`;
                try { const errData = await registerResponse.json(); errMsg = errData.message || errData.title || errMsg; if (registerResponse.status === 400 && (errData.title?.includes("already exists") || errData.message?.includes("já existe"))) { errMsg = "Este email já se encontra registado."; } } catch { }
                throw new Error(errMsg);
            }
            console.log("Registo Passo 1: Login criado.");

            // Passo 2: Fazer Login
            const loginResponse = await fetch(`${API_BASE_URL}/api/Auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: email, password: password })
            });
            if (!loginResponse.ok) throw new Error("Falha ao autenticar após registo.");
            const loginData = await loginResponse.json();
            if (!loginData.token) throw new Error("Token não recebido após login.");
            authToken = loginData.token;
            const decodedToken = jwtDecode(authToken);
            const loginId = decodedToken.nameid;
            if (!loginId) throw new Error("ID do utilizador não encontrado no token.");
            console.log(`Registo Passo 2: Login OK. ID: ${loginId}`);

            // Passo 3: Criar Empresa
            const empresaPayload = {
                funcionarioEmpresa: funcionarioEmpresa,
                nomeEmpresa: nomeEmpresa,
                nifEmpresa: parseInt(nifEmpresa, 10),
                ruaEmpresa: ruaEmpresa,
                codigoPostal: codigoPostal,
                loginIdlogin: parseInt(loginId, 10),
                contactoE1: parseInt(contactoE1, 10),
                contactoE2: contactoE2 ? parseInt(contactoE2, 10) : null
            };

            const empresaResponse = await fetch(`${API_BASE_URL}/api/Empresas`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${authToken}` },
                body: JSON.stringify(empresaPayload)
            });

            if (!empresaResponse.ok) {
                let errMsg = `Erro ${empresaResponse.status} ao criar perfil de empresa.`;
                try { const errorData = await empresaResponse.json(); errMsg = errorData.detail || errorData.title || (errorData.errors ? JSON.stringify(errorData.errors) : errMsg); } catch { }
                throw new Error(errMsg);
            }
            console.log("Registo Passo 3: Perfil de Empresa criado.");

            // Sucesso
            alert("Registo efetuado com sucesso!");
            login(authToken); // Chama login do contexto com o token
            // ****** NAVEGAÇÃO ATUALIZADA ******
            navigate("/Prestador/Concursos"); // Navega para a página de concursos do prestador (role ID 3)

        } catch (err) {
            console.error("Erro detalhado no processo de registo:", err);
            setError(err.message || "Ocorreu um erro inesperado durante o registo.");
        } finally {
            setIsLoading(false);
        }
    };

    // JSX atualizado para o formulário de prestador
    return (
        <div className={"outsideDiv w-full max-w-lg p-6 md:p-8"}>
            <h4 className="text-xl font-bold text-center mb-6">Registo de Empresa</h4>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
                {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
                <InputFieldLong id="email-register" placeholder="Email *" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} autoComplete="email"/>
                <InputFieldLong id="password-register" placeholder="Password *" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} autoComplete="new-password"/>
                <InputFieldLong id="confirm-password-register" placeholder="Confirmar Password *" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={isLoading} autoComplete="new-password"/>
                <hr className="my-4 border-gray-300"/>
                <InputFieldLong id="nome-empresa-register" placeholder="Nome da Empresa *" type="text" value={nomeEmpresa} onChange={(e) => setNomeEmpresa(e.target.value)} required disabled={isLoading} />
                <InputFieldLong id="funcionario-register" placeholder="Nome do Funcionário *" type="text" value={funcionarioEmpresa} onChange={(e) => setFuncionarioEmpresa(e.target.value)} required disabled={isLoading} />
                <InputFieldLong id="nif-register" placeholder="NIF da Empresa (9 dígitos) *" type="text" pattern="\d{9}" title="NIF deve ter 9 dígitos" value={nifEmpresa} onChange={(e) => setNifEmpresa(e.target.value)} required disabled={isLoading} />
                <InputFieldLong id="rua-register" placeholder="Rua da Empresa *" type="text" value={ruaEmpresa} onChange={(e) => setRuaEmpresa(e.target.value)} required disabled={isLoading} autoComplete="street-address"/>
                <InputFieldLong id="cp-register" placeholder="Código Postal (Ex: 1234-567) *" type="text" value={codigoPostal} onChange={(e) => setCodigoPostal(e.target.value)} required disabled={isLoading} autoComplete="postal-code"/>
                <InputFieldLong id="contacto1-register" placeholder="Contacto Principal (9 dígitos) *" type="tel" pattern="\d{9}" title="Número deve ter 9 dígitos" value={contactoE1} onChange={(e) => setContactoE1(e.target.value)} required disabled={isLoading} autoComplete="tel-national"/>
                <InputFieldLong id="contacto2-register" placeholder="Contacto Secundário (9 dígitos, Opcional)" type="tel" pattern="\d{9}" title="Número deve ter 9 dígitos" value={contactoE2} onChange={(e) => setContactoE2(e.target.value)} disabled={isLoading} />
                <p className="text-xs text-gray-500 mt-1">* Campo obrigatório</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center w-full mt-5">
                    <Button text={isLoading ? "A Registar..." : "Registar"} variant="primary" type="submit" className="flex-1" disabled={isLoading}/>
                </div>
                <div className="text-center mt-4">
                    <Button text="Já tem conta? Iniciar Sessão" variant="text" type="button" onClick={() => navigate('/login')} disabled={isLoading} />
                </div>
            </form>
        </div>
    );
};

export default RegisterFormPrestador;
