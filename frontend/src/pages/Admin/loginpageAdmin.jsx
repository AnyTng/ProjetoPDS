import LoginForm from "../../components/loginform.jsx";

const LoginPageAdmin = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6">
            <div className="w-full max-w-md space-y-4">
                <h1 className="text-2xl font-bold text-center">Área do Administrador</h1>
                <LoginForm />
            </div>
        </div>
    );
};

export default LoginPageAdmin;