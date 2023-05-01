import { Routes, Route } from "react-router-dom";

import { Navigate } from 'react-router-dom';

import InicioPro from "./InicioPro";
import Entregas from "./Entregas";
import ActaReunion from "./ActaReunion";

export default function RoutesPro() {

    return (<div>
        <Routes>
            <Route path="/" element={<InicioPro />} >
                <Route path="Entregas" element={<Entregas />} />
                <Route path="Reuniones" element={<ActaReunion />} />
            </Route>
            <Route path="*" element={<Navigate to="" replace />} />
        </Routes></div>
    );
}

