import { Routes, Route } from "react-router-dom";

import { Navigate } from 'react-router-dom';

import InicioUser from "./InicioUser";
import Proyectos from './proyectos/Proyectos';
import VerProyecto from './proyectos/VerProyecto';
import Solicitudes from './solicitudes/Solicitudes';
import Inicio from './inicio/Inicio';
import Entregas from "./entregas/Entregas";

export default function RoutesUsers() {

    return (

        <Routes>
            <Route path="/" element={<InicioUser />} >
                <Route index element={<Inicio />} />
                <Route path="proyectos" element={<Proyectos />} />
                <Route path="verProyecto" element={<VerProyecto />} />
                <Route path="solicitudes" element={<Solicitudes />} />
                <Route path="entregas" element={<Entregas />} />
            </Route>
            <Route path="*" element={<Navigate to="" replace />} />
        </Routes>
    );
}
