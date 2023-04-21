import React from "react";
import { useSelector } from "react-redux";
import { selectUser, selectTipo } from "./authSlice";
import { Navigate, useLocation } from "react-router-dom";

export const ProtectedRoute = ({ element, roles }) => {
    const location = useLocation();
    const user = useSelector(selectUser);
    const rol = useSelector(selectTipo);
    if (!user) {
        return <Navigate to="/unauthorized" state={{ from: location }} />;
    } else if (roles.includes(rol)) {
        return element;
    }
    return <Navigate to="/unauthorized" state={{ from: location }} />;

};
