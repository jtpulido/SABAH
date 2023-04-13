import { Routes, Route } from "react-router-dom";

import { Navigate } from 'react-router-dom';

import InicioUser from "./InicioUser";

export default function RoutesUsers() {

    return (

        <Routes>
            <Route path="/" element={<InicioUser />} />
            <Route path="*" element={<Navigate to="/inicio" replace />} />
        </Routes>
    );
}
