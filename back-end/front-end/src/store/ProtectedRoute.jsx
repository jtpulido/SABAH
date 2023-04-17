import React from "react";
import { useSelector } from "react-redux";
import { selectUser } from "./authSlice";
import { Navigate, useLocation } from "react-router-dom";

export const ProtectedRoute = ({ element, roles }) => {
    const location = useLocation();
    const user = useSelector(selectUser);
    if (!user) {
        return <Navigate to="/" />;
    }
    if (roles.includes(user.id_tipo_usuario)) {

        return element;
    } else {
        return <Navigate to="/unauthorized" state={{ from: location }} />;
    }
};
