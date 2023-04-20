import { Routes, Route } from "react-router-dom";

import { Navigate } from 'react-router-dom';

import InicioCmt from "./InicioCmt";
import Proyectos from "./Proyectos";
import Lectores from "./Lectores";
export default function RoutesCmt() {

    return (<div>
        <Routes>
            <Route path="/" element={<InicioCmt />} >
                <Route index element={<Proyectos />} />
                <Route path="lectores" element={<Lectores />} />
            </Route>
            <Route path="*" element={<Navigate to="" replace />} />
        </Routes></div>
    );
}
