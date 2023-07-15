import { Routes, Route } from "react-router-dom";

import { Navigate } from 'react-router-dom';

import InicioUser from "./InicioUser";
import Proyectos from './proyectos/Proyectos'
import VerProyecto from './proyectos/VerProyecto'

export default function RoutesUsers() {

    return (

        <Routes>
            <Route path="/" element={<InicioUser />} >
                <Route path="proyectos" element={<Proyectos />} />
                <Route path="verProyecto" element={<VerProyecto />} />
            </Route>
            <Route path="*" element={<Navigate to="" replace />} />
        </Routes>
    );
}
