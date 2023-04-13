import { Routes, Route } from "react-router-dom";


import InicioUser from "./InicioUser";
export default function RoutesUser() {

    return (

        <Routes>
            <Route path="/inicio" element={<PrivateRoute >
                <InicioUser />
            </PrivateRoute>} />
        </Routes>
    );
}
