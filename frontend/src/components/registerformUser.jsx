import { useState } from "react";
import InputFieldLong from "./inputFieldLong.jsx";
import Button from "./Button";
import "../css/global.css";

const RegisterForm = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [cartaConducao, setCarta] = useState("");
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Registering in with:", { email, password, name, lastName, phone, cartaConducao });
    }

    return (
        <div className={"outsideDiv"}>
            <h4 className="text-xl font-bold text-center my-4">Registar</h4>
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
                <div className="my-2">
                <InputFieldLong
                    placeholder="Nome"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                </div>
                <div className="my-2">
                <InputFieldLong
                    placeholder="Apelido"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                />
                </div>
                <div className="my-2">
                <InputFieldLong
                    placeholder="Telemóvel"
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />
                </div>
                <div className="my-2">
                    <InputFieldLong
                        placeholder="Carta de Condução"
                        type="text"
                        value={cartaConducao}
                        onChange={(e) => setCarta(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 justify-center w-full">
                    <Button text="É um prestador de serviços?" variant="text" type="button" style={{flex: 1}} />
                    <Button text="Registar" variant="primary" type="submit" style={{flex: 1}} />

                </div>
            </form>
        </div>
    )





}

export default RegisterForm;