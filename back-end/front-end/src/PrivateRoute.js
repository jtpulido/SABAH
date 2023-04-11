import { Navigate } from "react-router-dom";

export const PrivateRoute = ({ element,user,isAuthenticated, roles }) => {
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (roles && !roles.includes(user.id_tipo_usuario)) {
    return <Navigate to="/" />;
  }

  return element
}
