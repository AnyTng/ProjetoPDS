import { useState } from "react";
import InputFieldLong from "./inputFieldLong.jsx";
import Button from "./Button";
import { useNavigate } from "react-router-dom";
import "../css/global.css";
//import tailwind



const LoginForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Logging in with:", { email, password });
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
                    <Button text="Sign In" variant="primary" type="submit" style={{flex: 1}} onClick={handleSubmit} />
                </div>


            </form>
        </div>
    );
};

export default LoginForm;
