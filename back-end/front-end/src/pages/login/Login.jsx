import React, { Fragment, useState } from "react";
import { useCookies } from 'react-cookie';
import Footer from "../pie_de_pagina/Footer"
import "./Login.css";
import logo from "../../assets/images/logo.png";
import { Button, TextField, Alert, Snackbar } from "@mui/material";
import { useNavigate } from 'react-router-dom';
export const Login = () => {

  const [cookies, setCookie] = useCookies(['token', 'tipo_usuario']);


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
        body: JSON.stringify(usuario)
      });
      const data = await response.json();
      if (!data.success) {
        setError(data.message);
      } else {
        const expires = new Date();
        expires.setTime(expires.getTime() + (2 * 60 * 60 * 1000)); // caduca en dos horas

        console.log(expires)
        setCookie('token', data.token, { path: '/', expires });
        setCookie('tipo_usuario', data.tipo_usuario, { path: '/', expires });

        const tipo_usuario = data.tipo_usuario
        console.log(tipo_usuario)
        if (tipo_usuario === 'admin') {
          navigate('/admin');
        } else if (tipo_usuario === 'normal') {
          navigate('/inicio');
        } else if (tipo_usuario === 'comite') {
          navigate('/comite');
        } else if (tipo_usuario === 'Proyecto'){
          navigate('/proyecto')
        }


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
                <TextField name="username" id="username" type="text" value={usuario.username} onChange={handleChange} />
                <p className="texto_correo">Contraseña *</p>
                <TextField name="password" id="password" type="password" value={usuario.password} onChange={handleChange} />
                <Button type="submit" disabled={!usuario.username || !usuario.password}>Iniciar Sesión</Button>
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
