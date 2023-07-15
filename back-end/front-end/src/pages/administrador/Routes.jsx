import { Routes, Route } from "react-router-dom";
import { Navigate } from 'react-router-dom';

import InicioAdmin from "./InicioAdmin";
import Usuarios from './usuarios/Usuarios'
import Proyectos from './proyectos/Proyectos'
import VerProyecto from './proyectos/VerProyecto'
import VerUsuario from './usuarios/VerUsuario'
import AgregarUsuario from "./usuarios/AgregarUsuario";
import ModificarUsuario from "./usuarios/ModificarUsuario";
import ModificarProyecto from "./proyectos/ModificarProyecto";

export default function RoutesAdmin() {

    return (<div>
        <Routes>
            <Route path="/" element={<InicioAdmin />} >
                <Route index element={<Usuarios />} />
                <Route path="verUsuario" element={<VerUsuario />} />
                <Route path="proyectos" element={<Proyectos />} />
                <Route path="verProyecto" element={<VerProyecto />} />
                <Route path="modificarProyecto" element={<ModificarProyecto />} />
                <Route path="agregarUsuario" element={<AgregarUsuario />} />
                <Route path="modificarUsuario" element={<ModificarUsuario />} />
            </Route>
            <Route path="*" element={<Navigate to="" replace />} />
        </Routes></div>
    );
}
