import { Route, Routes } from "react-router-dom";
import Login from './pages/login/Login'
import Inicio from './pages/usuarios/Inicio'


export default function AppRoutes() {
    return (
        <Routes>
            <Route index path="/" element={<Login />} />
            <Route index path="/inicio" element={<Inicio />} />
        </Routes>
    )
}

