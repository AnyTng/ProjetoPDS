import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/loginpageUserPrestador.jsx";
import RegisterPageUser from "./pages/RegisterPageUser.jsx";

function App() {
    return (
        <Router>
            <Routes>
                {/* The login page (root path) */}
                <Route path="/" element={<LoginPage />} />

                {/* The register page */}
                <Route path="/registerUser" element={<RegisterPageUser />} />




            </Routes>
        </Router>
    );
}

export default App;