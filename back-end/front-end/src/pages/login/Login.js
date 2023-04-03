import React, { Fragment, useState } from "react";
import "./Login.css";
import logo from "../../assets/images/logo.png";
import logo_ueb from "../../assets/images/logo_ueb.png";
import { Button, TextField, Alert, Snackbar } from "@mui/material";

export const Login = () => {
  const [usuario, setUsuario] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const handleClose = () => setError(null);

  const handleChange = (e) => setUsuario({ ...usuario, [e.target.name]: e.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch("http://192.168.1.9:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuario),
      });
      const data = await response.json();
      if (!data.success) {
        setError("Credenciales incorrectas");
      } else {
        setError("");
      }
    } catch (error) {
      console.error(error);
      setError("Ocurrió un error al intentar iniciar sesión");
    }
  };

  return (
    <Fragment>
      <div className="todo">
        {error && (
          <Snackbar open={true} autoHideDuration={6000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
            <Alert severity="error" onClose={handleClose}>
              {error}
            </Alert>
          </Snackbar>
        )}
        <div className="container">
          <div className="logo">
            <img src={logo} alt="" />
          </div>
          <div className="login">
            <div className="login_child">
              <form onSubmit={handleSubmit}>
                <p className="texto_correo">Correo o código de proyecto *</p>
                <TextField name="username" id="username" type="text" value={usuario.username} onChange={handleChange} />
                <p className="texto_correo">Contraseña *</p>
                <TextField name="password" id="password" type="password" value={usuario.password} onChange={handleChange} />
                <Button type="submit" disabled={!usuario.username || !usuario.password}>Iniciar Sesión</Button>
              </form>


            </div>
          </div>
        </div>
        <div className="footer">
          <footer>
            <div className="copyright">
              <p>
                © 2023 Sistema para la gestión de proyectos - Programa Ingeniería de Sistemas, Universidad El Bosque
              </p>
            </div>
            <div className="facultad">
              <p>Facultad de Ingeniería</p>
              <img src={logo_ueb} alt="" />
            </div>
          </footer>
        </div>
      </div>
    </Fragment>
  );
};

export default Login;
