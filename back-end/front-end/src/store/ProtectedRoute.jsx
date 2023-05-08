import React from "react";
import { useSelector } from "react-redux";
import { selectTipo, selectToken} from "./authSlice";
import { Navigate, useLocation } from "react-router-dom";

export const ProtectedRoute = ({ element, roles }) => {
    const location = useLocation();
    const token = useSelector(selectToken);
    const rol = useSelector(selectTipo);
    if (!token) {
        return <Navigate to="/unauthorized" state={{ from: location }} />;
    } else if (roles.includes(rol)) {
        return element;
    }
    return <Navigate to="/unauthorized" state={{ from: location }} />;

};
