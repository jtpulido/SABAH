import { Routes, Route } from "react-router-dom";
import { Navigate } from 'react-router-dom';

import InicioPro from "./InicioPro";

export default function RoutesProyect() {

    return (
        <Routes>
            <Route path="/" element={<InicioPro />} />
            <Route path="*" element={<Navigate to="" replace />} />
        </Routes>
    );
}
