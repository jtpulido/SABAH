import { Routes, Route } from "react-router-dom";

import { Navigate } from 'react-router-dom';

import InicioCmt from "./InicioCmt";
import Proyectos from "./proyectos/Proyectos";
import VerProyecto from "./proyectos/VerProyecto";
import Jurados from "./jurados/Jurados";
import Lectores from "./lectores/Lectores";
import Solicitudes from "./solicitudes/Solicitudes";
import Entregas from "./entregas/Entregas";
import Directores from "./directores/Directores";

export default function RoutesCmt() {

    return (<div>
        <Routes>
            <Route path="/" element={<InicioCmt />} >
                <Route index element={<Proyectos />} />
                <Route path="lectores" element={<Lectores />} />
                <Route path="jurados" element={<Jurados />} />
                <Route path="solicitudes" element={<Solicitudes />} />
                <Route path="entregas" element={<Entregas />} />
                <Route path="directores" element={<Directores />} />
                <Route path="verProyecto/:id" element={<VerProyecto />} />
            </Route>
            <Route path="*" element={<Navigate to="" replace />} />
        </Routes></div>
    );
}
