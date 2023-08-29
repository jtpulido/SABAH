import { Routes, Route } from "react-router-dom";

import { Navigate } from 'react-router-dom';

import InicioCmt from "./InicioCmt";
import Proyectos from "./proyectos/Proyectos";
import VerProyecto from "./proyectos/VerProyecto";
import Solicitudes from "./solicitudes/Solicitudes";
import Entregas from "./entregas/Entregas";
import Rubricas from "./rubrica_aspecto/Rubricas";
import Aspectos from "./rubrica_aspecto/Aspectos";
import Espacios from "./entregas/Espacio";
import Reportes from "./reportes/Reportes";
import Lectores from "./usuarios_normales/lectores/Lectores";
import Jurados from "./usuarios_normales/jurados/Jurados";
import Directores from "./usuarios_normales/directores/Directores";
import Reuniones from "./reuniones/Reuniones";

export default function RoutesCmt() {

    return (<div>
        <Routes>
            <Route path="/" element={<InicioCmt />} >
                <Route index element={<Proyectos />} />
                <Route path="lector" element={<Lectores />} />
                <Route path="jurado" element={<Jurados />} />
                <Route path="solicitudes" element={<Solicitudes />} />
                <Route path="entregas" element={<Entregas />} />
                <Route path="director" element={<Directores />} />
                <Route path="rubricas" element={<Rubricas />} />
                <Route path="aspectos" element={<Aspectos />} />
                <Route path="espacio" element={<Espacios />} />
                <Route path="verProyecto" element={<VerProyecto />} />
                <Route path="reportes" element={<Reportes />} />
                <Route path="Reuniones" element={<Reuniones />} />
            </Route>
            <Route path="*" element={<Navigate to="" replace />} />
        </Routes></div>
    );
}
