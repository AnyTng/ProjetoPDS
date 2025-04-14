// GeminiTakeThis/Frontend/src/components/registerformUser.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputFieldLong from "./inputFieldLong.jsx";
import Button from "./button.jsx";
import "../css/global.css";
import { useAuth } from "../hooks/useAuth";
import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = "http://localhost:5159";

const RegisterFormUser = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [nomeCliente, setNomeCliente] = useState("");
    const [dataNascCliente, setDataNascCliente] = useState("");
    const [nifCliente, setNifCliente] = useState("");
    const [ruaCliente, setRuaCliente] = useState("");
    const [codigoPostal, setCodigoPostal] = useState(""); // Alterado de codigoPostalCP
    const [localidade, setLocalidade] = useState(""); // Adicionado campo para localidade
    const [contactoC1, setContactoC1] = useState("");
    const [contactoC2, setContactoC2] = useState("");

    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Função para validar o código postal (ex: 1234-567 ou 1234567)
    const validateCodigoPostal = (cp) => {
        if (!cp) return false;
        const cpDigits = cp.replace('-', '');
        return /^\d{7}$/.test(cpDigits);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        // --- Validações Frontend ---
        if (password !== confirmPassword) {
            setError("As passwords não coincidem.");
            setIsLoading(false);
            return;
        }
        if (!validateCodigoPostal(codigoPostal)) { // Usar a nova função de validação
            setError("Formato inválido para Código Postal (Ex: 1234-567 ou 1234567).");
            setIsLoading(false);
            return;
        }
        if (!localidade || !localidade.trim()) {
            // A string é nula, indefinida, vazia ("") ou contém apenas espaços
            setError("Localidade é obrigatória.");
            setIsLoading(false);
            return;
        }
        if (!/^\d{9}$/.test(nifCliente)) {
            setError("NIF inválido. Deve ter 9 dígitos.");
            setIsLoading(false);
            return;
        }
        if (!/^\d{9}$/.test(contactoC1)) {
            setError("Contacto principal inválido. Deve ter 9 dígitos.");
            setIsLoading(false);
            return;
        }
        if (contactoC2 && !/^\d{9}$/.test(contactoC2)) {
            setError("Contacto secundário inválido. Deve ter 9 dígitos.");
            setIsLoading(false);
            return;
        }
        // --- Fim Validações ---

        let loginId = null;
        let authToken = null;

        try {
            // Passo 1: Registar Login (igual)
            const TIPO_LOGIN_CLIENTE = 2;
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
                if (registerResponse.status === 400) {
                    try {
                        const errData = await registerResponse.json();
                        errMsg = errData.message || "Este email já está registado.";
                    } catch {
                        errMsg = "Este email já está registado ou os dados são inválidos.";
                    }
                }
                throw new Error(errMsg);
            }
            console.log("Passo 1: Login registado.");

            // Passo 2: Login para obter ID e Token (igual)
            const loginResponse = await fetch(`${API_BASE_URL}/api/Auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: email, password: password })
            });
            if (!loginResponse.ok) throw new Error("Falha ao autenticar após registo inicial.");

            const loginData = await loginResponse.json();
            if (!loginData.token) throw new Error("Token não recebido após login pós-registo.");
            authToken = loginData.token;

            const decodedToken = jwtDecode(authToken);
            loginId = decodedToken.nameid; // Assume que 'nameid' é o ID do login
            if (!loginId) throw new Error("ID do utilizador não encontrado no token.");
            console.log(`Passo 2: Login OK. ID: ${loginId}`);

            // Passo 3: Criar Cliente (Payload AJUSTADO para o DTO)
            const clientePayload = {
                nomeCliente: nomeCliente,
                dataNascCliente: dataNascCliente || null,
                // Backend agora espera int, frontend valida como string 9 dígitos
                nifCliente: parseInt(nifCliente, 10),
                ruaCliente: ruaCliente,
                // Enviar o código postal como string e a localidade
                codigoPostal: codigoPostal,
                localidade: localidade,
                loginIdlogin: parseInt(loginId, 10), // ID do login criado
                // Backend espera int?, frontend valida como string 9 dígitos
                contactoC1: parseInt(contactoC1, 10),
                contactoC2: contactoC2 ? parseInt(contactoC2, 10) : null,
                // EstadoValCc não é enviado, definido no backend
            };


            const clienteResponse = await fetch(`${API_BASE_URL}/api/Clientes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}` // Usa o token obtido no passo 2
                },
                body: JSON.stringify(clientePayload)
            });


            if (!clienteResponse.ok) {
                // Tentar ler a mensagem de erro do backend
                let errMsg = `Erro ${clienteResponse.status} ao criar perfil cliente.`;
                try {
                    const errorData = await clienteResponse.json();
                    // Tenta usar mensagens específicas do ASP.NET Core ValidationProblemDetails ou erros gerais
                    errMsg = errorData.detail || errorData.title || (errorData.errors ? JSON.stringify(errorData.errors) : errMsg);
                } catch {
                    // Ignora se não conseguir ler o JSON do erro
                }
                // Tentar reverter o login criado? (complexo, talvez não necessário)
                // await fetch(`${API_BASE_URL}/api/Logins/${loginId}`, { method: "DELETE", headers: { /* Auth Token Admin? */ } });
                throw new Error(errMsg);
            }
            console.log("Passo 3: Perfil Cliente criado.");

            // Sucesso
            alert("Registo completo!");

            // Login automático (igual)
            const userData = {
                token: authToken,
                email: decodedToken.name, // Email do token
                id: loginId, // ID do login
                roleId: decodedToken.TipoLoginIDTLogin, // Role ID do token
                roleName: getRoleNameFromId(decodedToken.TipoLoginIDTLogin) // Role Name derivado
            };
            login(userData);
            navigate("/user/profile"); // Ou para outra página pós-registo

        } catch (err) {
            console.error("Erro detalhado no registo:", err);
            setError(err.message || "Ocorreu um erro inesperado durante o registo.");
            // Aqui seria o local ideal para tentar apagar o login se a criação do cliente falhou,
            // mas isso requereria outra chamada API e talvez permissões especiais.
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

    return (
        <div className={"outsideDiv w-full max-w-lg"}>
            <h4 className="text-xl font-bold text-center my-4">Registar Novo Utilizador</h4>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
                {error && <p className="text-red-500 text-sm text-center mb-2">{error}</p>}

                <InputFieldLong placeholder="Email *" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} autoComplete="username"/>
                <InputFieldLong placeholder="Password *" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} autoComplete="new-password"/>
                <InputFieldLong placeholder="Confirmar Password *" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={isLoading} autoComplete="new-password"/>

                <hr className="my-3 border-gray-300"/>

                <InputFieldLong placeholder="Nome Completo *" type="text" value={nomeCliente} onChange={(e) => setNomeCliente(e.target.value)} required disabled={isLoading} />
                <InputFieldLong placeholder="Data de Nascimento" type="date" value={dataNascCliente} onChange={(e) => setDataNascCliente(e.target.value)} disabled={isLoading} />
                {/* Validação HTML5 básica para NIF e Contactos */}
                <InputFieldLong placeholder="NIF (9 dígitos) *" type="text" pattern="\d{9}" title="NIF deve ter 9 dígitos" value={nifCliente} onChange={(e) => setNifCliente(e.target.value)} required disabled={isLoading} />
                <InputFieldLong placeholder="Rua *" type="text" value={ruaCliente} onChange={(e) => setRuaCliente(e.target.value)} required disabled={isLoading} />
                {/* Input para Código Postal */}
                <InputFieldLong placeholder="Código Postal (Ex: 1234-567) *" type="text" value={codigoPostal} onChange={(e) => setCodigoPostal(e.target.value)} required disabled={isLoading} />
                {/* Input para Localidade */}
                <InputFieldLong placeholder="Localidade *" type="text" value={localidade} onChange={(e) => setLocalidade(e.target.value)} required disabled={isLoading} />
                {/* Inputs para Contactos */}
                <InputFieldLong placeholder="Contacto Principal (9 dígitos) *" type="tel" pattern="\d{9}" title="Número deve ter 9 dígitos" value={contactoC1} onChange={(e) => setContactoC1(e.target.value)} required disabled={isLoading} />
                <InputFieldLong placeholder="Contacto Secundário (9 dígitos, Opcional)" type="tel" pattern="\d{9}" title="Número deve ter 9 dígitos" value={contactoC2} onChange={(e) => setContactoC2(e.target.value)} disabled={isLoading} />

                <p className="text-xs text-gray-500 mt-1">* Campo obrigatório</p>

                <div className="flex gap-2 justify-center w-full mt-3">
                    <Button text="É uma Empresa?" variant="text" type="button" style={{ flex: 1 }} disabled={isLoading} />
                    <Button text={isLoading ? "A Registar..." : "Registar"} variant="primary" type="submit" style={{ flex: 1 }} disabled={isLoading} />
                </div>
            </form>
        </div>
    );
};

export default RegisterFormUser;