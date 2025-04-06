import { useState } from "react";
import InputFieldLong from "../../../../../../../../Downloads/ProjetoPDS-dev/ProjetoPDS-dev/frontend/src/components/inputFieldLong.jsx";
import Button from "../../../../../../../../Downloads/ProjetoPDS-dev/ProjetoPDS-dev/frontend/src/components/button.jsx";
import "../../../../../../../../Downloads/ProjetoPDS-dev/ProjetoPDS-dev/frontend/src/css/global.css";

const RegisterForm = () => {

    const [NomeCliente, setName] = useState("");
    const [DataNascCliente, setDate] = useState("");
    const [Nifcliente, setNif] = useState("");
    const [CodigoPostalCP, setCp] = useState("");
    const [ContactoC1, setPhone1] = useState("");
    const [ContactoC2, setPhone2] = useState("");
    const handleSubmit = async(e) => {
        try {
            const response = await fetch("http://localhost:5208/api/Clientes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    NomeCliente,
                    DataNascCliente,
                    Nifcliente,
                    ContactoC1,
                    ContactoC2
                })
            });

            if (!response.ok) throw new Error("Email ou palavra-passe inválidos.");
            const data = await response.json();
            login(data);
        } catch (error) {
            console.error("Error:", error);
            alert("Erro ao autenticar. Tente novamente.");
        }
    }

    return (
        <div className={"outsideDiv"}>
            <h4 className="text-xl font-bold text-center my-4">Registar</h4>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
                <div className="my-2">
                    <InputFieldLong
                    placeholder="Nome de utilizador"
                    type="text"
                    value={NomeCliente}
                    onChange={(e) => setName(e.target.value)}
                />
                </div>
                <div className="my-2">
                <InputFieldLong
                    placeholder="Data de Nascimento"
                    type="date"
                    value={DataNascCliente}
                    onChange={(e) => setDate(e.target.value)}
                />
                </div>
                <div className="my-2">
                <InputFieldLong
                    placeholder="NIF"
                    type="int"
                    value={Nifcliente}
                    onChange={(e) => setNif(e.target.value)}
                />
                </div>
                                
                <div className="my-2">
                <InputFieldLong
                    placeholder="CP (Ex: 1234567)"
                    type="text"
                    value={CodigoPostalCP}
                    onChange={(e) => setCp(e.target.value)}
                />
                </div>
                <div className="my-2">
                <InputFieldLong
                    placeholder="Telemóvel"
                    type="text"
                    value={ContactoC1}
                    onChange={(e) => setPhone1(e.target.value)}
                />
                </div>
                <div className="my-2">
                <InputFieldLong
                    placeholder="Telemóvel"
                    type="text"
                    value={ContactoC2}
                    onChange={(e) => setPhone2(e.target.value)}
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