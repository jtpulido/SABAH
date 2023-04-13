import { Routes, Route } from "react-router-dom";

import { Navigate } from 'react-router-dom';

import InicioCmt from "./InicioCmt";

export default function RoutesCmt() {

    return (

        <Routes>
            <Route path="/" element={<InicioCmt />} />
            <Route path="*" element={<Navigate to="/comite" replace />} />
        </Routes>
    );
}
