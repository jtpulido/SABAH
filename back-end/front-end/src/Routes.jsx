import { Routes, Route } from "react-router-dom";

import Login from "./pages/login/Login";
import Inscribir from "./pages/login/inscribir propuesta/Inscribir"
import RoutesAdmin from "./pages/administrador/Routes";
import RoutesProyect from "./pages/proyecto/Routes";
import RoutesCmt from "./pages/comite/Routes";
import RoutesUsers from "./pages/usuarios/Routes";
import NotFoundPage from "./pages/NotFoundPage";
import UnauthorizedPage from "./pages/Unauthorized";
import { ProtectedRoute } from "./store/ProtectedRoute";
import { Provider } from 'react-redux';
import configureAuthStore from './store/store';

export default function AppRoutes() {
    const store = configureAuthStore();
    return (
        <Provider store={store}>
            <Routes>
                <Route path="/">
                    <Route path="" element={<Login />} />
                    <Route path="/admin/*" element={<ProtectedRoute roles={["admin"]} element={<RoutesAdmin />} />} />
                    <Route path="/proyecto/*" element={<ProtectedRoute roles={["proyecto"]} element={<RoutesProyect />} />} />
                    <Route path="/comite/*" element={<ProtectedRoute roles={["comite"]} element={<RoutesCmt />} />} />
                    <Route path="/user/*" element={<ProtectedRoute roles={["normal"]} element={<RoutesUsers />} />} />
                    <Route path="*" element={<NotFoundPage />} />
                    <Route path="/unauthorized" element={<UnauthorizedPage />} />
                    <Route path="/inscribirPropuesta/" element={<Inscribir />} />
                </Route>
            </Routes>
        </Provider >
    );
}
