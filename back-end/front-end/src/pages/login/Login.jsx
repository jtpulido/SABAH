import React, { Fragment, useState } from "react";
import { useCookies } from 'react-cookie';
import Footer from "../pie_de_pagina/Footer"
import "./Login.css";
import logo from "../../assets/images/logo.png";
import { Button, TextField, Alert, Snackbar } from "@mui/material";
import { useNavigate } from 'react-router-dom';
export const Login = () => {

  const [cookies,setCookie] = useCookies(['session', 'tipo_usuario']);


  const navigate = useNavigate();

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
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuario),
        credentials: 'include'
      });
      
      const cookiesBack = document.cookie.split(';');
      const sessionCookie = cookiesBack.find(cookie => cookie.trim().startsWith('session='));
      const sessionID = sessionCookie ? sessionCookie.split('=')[1] : null;
      const otherCookie = cookiesBack.find(cookie => cookie.trim().startsWith('tipo_usuario='));
      const tipo_usuario = otherCookie ? otherCookie.split('=')[1] : null;

      const data = await response.json();

      if (!data.success) {
        setError(data.message);

      } else {

        
        if (tipo_usuario === 'admin') {
          navigate('/admin');
        } else if (tipo_usuario === 'normal') {
          navigate('/inicio');
        } else if (tipo_usuario === 'comite') {
          navigate('/comite');
        }
        setCookie('session', sessionID, { path: '/' });
        setCookie('tipo_usuario', tipo_usuario, { path: '/' });
        
      }
    } catch (error) {
      setError("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.");
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
                <TextField className="input_user" name="username" id="username" type="text" value={usuario.username} onChange={handleChange} />
                <p className="texto_correo">Contraseña *</p>
                <TextField name="password" id="password" type="password" value={usuario.password} onChange={handleChange} />
                <Button style={{ textTransform: "none" }} type="submit" disabled={!usuario.username || !usuario.password}>Iniciar Sesión</Button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </Fragment>
  );
};

export default Login;
