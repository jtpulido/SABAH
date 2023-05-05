import { Routes, Route } from "react-router-dom";

import { Navigate } from 'react-router-dom';
import InicioAdmin from "./InicioAdmin";
import Usuarios from './usuarios/Usuarios'
import Proyectos from './proyectos/Proyectos'

export default function RoutesAdmin() {

    return (<div>
        <Routes>
            <Route path="/" element={<InicioAdmin />} >
                <Route index element={<Usuarios />} />
                <Route path="proyectos" element={<Proyectos />} />
                <Route path="verProyecto/:id" element={<VerProyecto />} />
            </Route>
            <Route path="*" element={<Navigate to="" replace />} />
        </Routes></div>
    );
}
