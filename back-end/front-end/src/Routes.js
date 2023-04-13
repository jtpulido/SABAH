import { Routes, Route,Navigate} from "react-router-dom";
import { PrivateRoute } from "./components/PrivateRoute";

import { AuthProvider } from "./components/AuthContext";

import Login from "./pages/login/Login";
import RoutesAdmin from "./pages/administrador/Routes";
import RoutesProyect from "./pages/proyecto/Routes";
import RoutesCmt from "./pages/comite/Routes";
import RoutesUsers from "./pages/usuarios/Routes";

export default function AppRoutes() {

    return (
        <AuthProvider>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="*" element={<Navigate to="/" replace />} />
                <Route path="/admin/*" element={
                <PrivateRoute >
                    <RoutesAdmin />
                </PrivateRoute>} />

                <Route path="/proyecto/*" element={<PrivateRoute >
                    <RoutesProyect />
                </PrivateRoute>} />

                <Route path="/comite/*" element={<PrivateRoute >
                    <RoutesCmt />
                </PrivateRoute>} />

                <Route path="/inicio/*" element={<PrivateRoute >
                    <RoutesUsers />
                </PrivateRoute>} />
            </Routes>
        </AuthProvider>
    );
}
