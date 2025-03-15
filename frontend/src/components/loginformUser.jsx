import { useState } from "react";
import InputField from "./inputField.jsx";
import Button from "./Button";
import "../css/global.css";
//import tailwind



const LoginForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Logging in with:", { email, password });
    };

    return (
        <div className={"outsideDiv"}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
                <div className="my-2">
                    <InputField
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                </div>
                <div className="my-2">
                <InputField
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                </div>

                <div className="flex gap-2 justify-center w-full">
                    <Button text="Registrar" variant="secondary" style={{flex: 1}} />
                    <Button text="Sign In" variant="primary" type="submit" style={{flex: 1}} />
                </div>


            </form>
        </div>
    );
};

export default LoginForm;
