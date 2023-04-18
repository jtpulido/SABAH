import { Routes, Route } from "react-router-dom";

import { Navigate } from 'react-router-dom';
import InicioAdmin from "./InicioAdmin";
import Inbox from "./Inbox";

export default function RoutesAdmin() {

    return (
        <Routes>
            <Route path="" element={<InicioAdmin />} />
            <Route path="inbox" element={<Inbox />} />
            <Route path="*" element={<Navigate to="" replace />} />
        </Routes>
    );
}
