import { Routes, Route } from "react-router-dom";

import { Navigate } from 'react-router-dom';

import InicioPro from "./InicioPro";
import Entregas from "./Entregas";
import ActaReunion from "./ActaReunion";
import VerProyecto from "./VerProyecto";
import Reuniones from "./Reuniones";
import Solicitudes from "./Solicitudes";
import VerReunion from "./VerReunion";
import ActaSolicitud from "./ActaSolicitud";

export default function RoutesPro() {

    return (<div>
        <Routes>
            <Route path="/" element={<InicioPro />} >
                <Route index element={<VerProyecto />} />
                <Route path="Entregas" element={<Entregas />} />
                <Route path="ActaReunion/:id" element={<ActaReunion />} />
                <Route path="ActaSolicitud" element={<ActaSolicitud />} />
                <Route path="Reuniones" element={<Reuniones />} />
                <Route path="Solicitudes" element={<Solicitudes />} />
                <Route path="VerReunion" element={<VerReunion />} />

            </Route>
            <Route path="*" element={<Navigate to="" replace />} />
        </Routes></div>
    );
}

