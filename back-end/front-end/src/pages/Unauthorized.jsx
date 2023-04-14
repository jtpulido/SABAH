import React from "react";
import { Link } from "react-router-dom";

const UnauthorizedPage = () => {
    return (
        <div>
            <h1>Acceso no autorizado</h1>
            <p>Lo sentimos, no tienes permiso para acceder a esta página.</p>
            <Link to="/">Iniciar sesión</Link>
        </div>
    );
};

export default UnauthorizedPage;
