import { Routes, Route } from "react-router-dom";
import { Navigate } from 'react-router-dom';

import InicioAdmin from "./InicioAdmin";
import Usuarios from './usuarios/Usuarios';
import Proyectos from './proyectos/Proyectos';
import VerProyecto from './proyectos/VerProyecto';
import VerUsuario from './usuarios/VerUsuario';
import Estudiantes from './estudiantes/Estudiantes';
import VerEstudiante from './estudiantes/VerEstudiante';

export default function RoutesAdmin() {

    return (<div>
        <Routes>
            <Route path="/" element={<InicioAdmin />} >
                <Route index element={<Usuarios />} />
                <Route path="verUsuario" element={<VerUsuario />} />
                <Route path="proyectos" element={<Proyectos />} />
                <Route path="verProyecto" element={<VerProyecto />} />
                <Route path="estudiantes" element={<Estudiantes />} />
                <Route path="verEstudiante" element={<VerEstudiante />} />
            </Route>
            <Route path="*" element={<Navigate to="" replace />} />
        </Routes></div>
    );
}
