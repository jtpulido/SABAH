import React, { useContext, useEffect } from 'react';

import { Navigate } from 'react-router-dom';

import { MyContext } from "./AuthContext";


export const PrivateRoute = ({ children }) => {

  const { user, setUser } = useContext(MyContext);
  console.log("1", user)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    console.log("1.5", storedUser)
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
  console.log("2", user)
  const ruta = children.type.name
  if (user && user.id_tipo_usuario) {
    console.log("3", user)
    const rol = user.id_tipo_usuario

    if (ruta === "RoutesAdmin" && rol === "admin") {
      return children
    } else if (ruta === "RoutesUsers" && rol === "normal") {
      return children
    } else if (ruta === "RoutesCmt" && rol === "comite") {
      return children
    } else if (ruta === "RoutesProyect" && rol === "proyecto") {
      return children
    }
    console.log("4", user)
    return <Navigate to="/unauthorized" />;
  } else {
    console.log("5", user)
    return <Navigate to="/" />;
  }
}
