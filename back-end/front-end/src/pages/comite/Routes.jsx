import { Routes, Route } from "react-router-dom";

import { Navigate } from 'react-router-dom';

import InicioCmt from "./InicioCmt";
import Proyectos from "./Proyectos";
import VerProyecto from "./VerProyecto";
import Lectores from "./Lectores";
export default function RoutesCmt() {

    return (<div>
        <Routes>
            <Route path="/" element={<InicioCmt />} >
                <Route index element={<Proyectos />} />
                <Route path="lectores" element={<Lectores />} />
                <Route path="VerProyecto/:id" element={<infoProyecto />} />
            </Route>
            <Route path="*" element={<Navigate to="" replace />} />
        </Routes></div>
    );
}
