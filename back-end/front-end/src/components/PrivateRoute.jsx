import React, { useContext } from 'react';

import { Navigate } from 'react-router-dom';

import { MyContext } from "./AuthContext";


export const PrivateRoute = ({ children }) => {

  const { user } = useContext(MyContext);

  if (user === null) {
    return <Navigate to="/" />;
  } 
  return children
}
