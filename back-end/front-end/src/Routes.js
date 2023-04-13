import { Routes, Route } from "react-router-dom";
import { PrivateRoute } from "./components/PrivateRoute";
import InicioPro from "./pages/proyecto/InicioPro";
import InicioCmt from "./pages/comite/InicioCmt";
import InicioUser from "./pages/usuarios/InicioUser";
import Login from "./pages/login/Login";
import { AuthProvider } from "./components/AuthContext";


import { Navigate } from 'react-router-dom';
import RoutesAdmin from "./pages/administrador/Routes";
export default function AppRoutes() {

    return (
        <AuthProvider>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="*" element={<Navigate to="/" replace />} />
                <Route path="/admin/*" element={<PrivateRoute >
                    <RoutesAdmin />
                </PrivateRoute>} />

                <Route path="/proyecto" element={<PrivateRoute >
                    <InicioPro />
                </PrivateRoute>} />

                <Route path="/comite" element={<PrivateRoute >
                    <InicioCmt />
                </PrivateRoute>} />

                <Route path="/inicio" element={<PrivateRoute >
                    <InicioUser />
                </PrivateRoute>} />
            </Routes>
        </AuthProvider>
    );
}
