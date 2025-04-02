import { useState } from "react";
import InputFieldLong from "./inputFieldLong.jsx";
import Button from "./Button";
import { useNavigate } from "react-router-dom";
import "../css/global.css";
import { useAuth } from "../hooks/useAuth";  // assuming this path is correct
//import tailwind


const LoginForm = () => {
    const { login } = useAuth();  // <== this is what fixes the error

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:5208/api/logins/authenticate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, hashPassword: password })
            });

            if (!response.ok) throw new Error("Email ou palavra-passe inválidos.");
            const data = await response.json();
            login(data);
        } catch (err) {
            alert("Erro ao iniciar sessão: " + err.message);
        }
    };

    const navigate = useNavigate();
    const handleRegister = () => {
        navigate("/registerUser");
    };

    return (
        <div className={"outsideDiv"}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
                <div className="my-2">
                    <InputFieldLong
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                </div>
                <div className="my-2">
                <InputFieldLong
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                </div>

                <div className="flex gap-2 justify-center w-full">
                    <Button text="Registar" variant="secondary" type="button" style={{flex: 1}} onClick={handleRegister}/>
                    <Button text="Iniciar Sessão" variant="primary" type="submit" style={{flex: 1}} />
                </div>


            </form>
        </div>
    );
};

export default LoginForm;
