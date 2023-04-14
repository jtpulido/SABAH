import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
    return (
        <div>
            <h1>La página no existe</h1>
            <p>Introduzca un dirección URL válida e inténtelo de nuevo</p>
            <Link to="/">Iniciar sesión</Link>
        </div>
    );
};

export default NotFoundPage;
