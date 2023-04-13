import React, { Fragment, useState, useContext } from "react";
import { MyContext } from "../../components/AuthContext";
import "./Login.css";
import logo from "../../assets/images/logo.png";
import { Button, TextField, Alert, Snackbar } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import Footer from '../pie_de_pagina/Footer';

export const Login = () => {

  const { setUser } = useContext(MyContext);
  
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const handleClose = () => setError(null);

  const handleChange = (e) => setUsuario({ ...usuario, [e.target.name]: e.target.value });

  const handleSubmit = async (event) => {
    setUser(null)
    event.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuario),
      });
      const data = await response.json();
      if (!data.success) {
        setError(data.user);
        setUser(null)
        localStorage.removeItem('user');
      } else {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.user.id_tipo_usuario === 'admin') {
          navigate('/admin');
        } else if (data.user.id_tipo_usuario === 'normal') {
          navigate('/inicio');
        } else if (data.user.id_tipo_usuario === 'comite') {
          navigate('/comite');
        }

      }
    } catch (error) {
      console.error(error);
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
