import { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import AuthContext from "./AuthContext";
import {PrivateRoute} from "./PrivateRoute";
import InicioPro from "./pages/proyecto/InicioPro";
import InicioAdmin from "./pages/administrador/InicioAdmin";
import Login from "./pages/login/Login";

export default function AppRoutes() {

    const { isAuthenticated, user } = useContext(AuthContext);

    return (
        <Routes>
            <Route index path="/" element={<Login />} />

            <Route path="/proyecto" element={<PrivateRoute user={user} isAuthenticated={isAuthenticated}>
                <InicioPro />
            </PrivateRoute>} />

            <Route path="/admin" element={<PrivateRoute user={user} isAuthenticated={isAuthenticated}>
                <InicioAdmin />
            </PrivateRoute>} />
        </Routes>
    );
}
