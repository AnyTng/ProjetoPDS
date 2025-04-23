// srcFrontend/components/registerformUser.jsx
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

const RegisterFormUser = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    // Estados (mantêm-se iguais)
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [nomeCliente, setNomeCliente] = useState("");
    const [dataNascCliente, setDataNascCliente] = useState("");
    const [nifCliente, setNifCliente] = useState("");
    const [ruaCliente, setRuaCliente] = useState("");
    const [codigoPostal, setCodigoPostal] = useState("");
    const [localidade] = "placeholder";
    const [contactoC1, setContactoC1] = useState("");
    const [contactoC2, setContactoC2] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        // Validações Frontend (mantêm-se iguais)
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
        if (!/^\d{9}$/.test(nifCliente)) {
            setError("NIF inválido. Deve ter exatamente 9 dígitos.");
            setIsLoading(false);
            return;
        }
        if (!/^\d{9}$/.test(contactoC1)) {
            setError("Contacto principal inválido. Deve ter exatamente 9 dígitos.");
            setIsLoading(false);
            return;
        }
        if (contactoC2 && !/^\d{9}$/.test(contactoC2)) {
            setError("Contacto secundário inválido. Deve ter 9 dígitos (se preenchido).");
            setIsLoading(false);
            return;
        }

        let authToken = null;

        try {
            // Passo 1: Registar Login
            // ****** TIPO_LOGIN_CLIENTE ATUALIZADO PARA 1 ******
            const TIPO_LOGIN_CLIENTE = 1;
            const registerResponse = await fetch(`${API_BASE_URL}/api/Auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: email,
                    password: password,
                    tipoLoginIDTLogin: TIPO_LOGIN_CLIENTE
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

            // Passo 3: Criar Cliente
            const clientePayload = {
                nomeCliente,
                dataNascCliente: dataNascCliente || null,
                nifCliente: parseInt(nifCliente, 10),
                ruaCliente,
                codigoPostal, // Envia como string (backend trata)
                localidade,
                loginIdlogin: parseInt(loginId, 10),
                contactoC1: parseInt(contactoC1, 10),
                contactoC2: contactoC2 ? parseInt(contactoC2, 10) : null,
            };
            const clienteResponse = await fetch(`${API_BASE_URL}/api/Clientes`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${authToken}` },
                body: JSON.stringify(clientePayload)
            });
            if (!clienteResponse.ok) {
                let errMsg = `Erro ${clienteResponse.status} ao criar perfil.`;
                try { const errorData = await clienteResponse.json(); errMsg = errorData.detail || errorData.title || (errorData.errors ? JSON.stringify(errorData.errors) : errMsg); } catch { }
                throw new Error(errMsg);
            }
            console.log("Registo Passo 3: Perfil Cliente criado.");

            // Sucesso
            alert("Registo efetuado com sucesso!");
            login(authToken); // Chama login do contexto com o token
            // ****** NAVEGAÇÃO ATUALIZADA ******
            navigate("/user/profile"); // Navega para perfil do cliente (role ID 1)

        } catch (err) {
            console.error("Erro detalhado no processo de registo:", err);
            setError(err.message || "Ocorreu um erro inesperado durante o registo.");
        } finally {
            setIsLoading(false);
        }
    };

    // JSX (mantém-se igual à resposta anterior, apenas o botão "É uma empresa?" pode navegar para outro sítio)
    return (
        <div className={"outsideDiv w-full max-w-lg p-6 md:p-8"}>
            <h4 className="text-xl font-bold text-center mb-6">Registar Novo Utilizador</h4>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
                {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
                <InputFieldLong id="email-register" placeholder="Email *" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} autoComplete="email"/>
                <InputFieldLong id="password-register" placeholder="Password *" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} autoComplete="new-password"/>
                <InputFieldLong id="confirm-password-register" placeholder="Confirmar Password *" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={isLoading} autoComplete="new-password"/>
                <hr className="my-4 border-gray-300"/>
                <InputFieldLong id="nome-register" placeholder="Nome Completo *" type="text" value={nomeCliente} onChange={(e) => setNomeCliente(e.target.value)} required disabled={isLoading} autoComplete="name" />
                <InputFieldLong id="data-nasc-register" placeholder="Data de Nascimento" type="date" value={dataNascCliente} onChange={(e) => setDataNascCliente(e.target.value)} disabled={isLoading} />
                <InputFieldLong id="nif-register" placeholder="NIF (9 dígitos) *" type="text" pattern="\d{9}" title="NIF deve ter 9 dígitos" value={nifCliente} onChange={(e) => setNifCliente(e.target.value)} required disabled={isLoading} />
                <InputFieldLong id="rua-register" placeholder="Rua *" type="text" value={ruaCliente} onChange={(e) => setRuaCliente(e.target.value)} required disabled={isLoading} autoComplete="street-address"/>
                <InputFieldLong id="cp-register" placeholder="Código Postal (Ex: 1234-567) *" type="text" value={codigoPostal} onChange={(e) => setCodigoPostal(e.target.value)} required disabled={isLoading} autoComplete="postal-code"/>
                <InputFieldLong id="contacto1-register" placeholder="Contacto Principal (9 dígitos) *" type="tel" pattern="\d{9}" title="Número deve ter 9 dígitos" value={contactoC1} onChange={(e) => setContactoC1(e.target.value)} required disabled={isLoading} autoComplete="tel-national"/>
                <InputFieldLong id="contacto2-register" placeholder="Contacto Secundário (9 dígitos, Opcional)" type="tel" pattern="\d{9}" title="Número deve ter 9 dígitos" value={contactoC2} onChange={(e) => setContactoC2(e.target.value)} disabled={isLoading} />
                <p className="text-xs text-gray-500 mt-1">* Campo obrigatório</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center w-full mt-5">
                    <Button text="É uma Empresa?" variant="text" type="button" className="flex-1" disabled={isLoading} onClick={() => navigate('/registerEmpresa')}/> {/* Leva para registo empresa */}
                    <Button text={isLoading ? "A Registar..." : "Registar"} variant="primary" type="submit" className="flex-1" disabled={isLoading}/>
                </div>
                <div className="text-center mt-4">
                    <Button text="Já tem conta? Iniciar Sessão" variant="text" type="button" onClick={() => navigate('/login')} disabled={isLoading} />
                </div>
            </form>
        </div>
    );
};

export default RegisterFormUser;
