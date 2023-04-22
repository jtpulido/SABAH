import React, { Fragment, useState } from "react";
import { useCookies } from 'react-cookie';
import Footer from "../pie_de_pagina/Footer"
import "./Login.css";
import logo from "../../assets/images/logo.png";
import { Button, TextField, Alert, Snackbar } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import { setUser } from '../../store/authSlice';
import { Recuperar1 } from '../login/ventanas/recuperar contrasena1/Recuperar1';

export const Login = () => {
  const [cookies, setCookie] = useCookies(['token', 'tipo_usuario']);

  const navigate = useNavigate();

  const [usuario, setUsuario] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState(null);
  const handleClose = () => setError(null);

  const [inputValues, setInputValues] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUsuario({ ...usuario, [name]: value });
    setInputValues({ ...inputValues, [name]: value });
  };

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
        setInputValues({ username: "", password: "" });

      } else {

        setCookie('token', data.token, { path: '/' });
        setCookie('tipo_usuario', data.tipo_usuario, { path: '/' });

        const tipo_usuario = data.tipo_usuario

        if (data.user.id_tipo_usuario === 'admin') {
          navigate('/admin');
        } else if (tipo_usuario === 'normal') {
          navigate('/inicio');
        } else if (tipo_usuario === 'comite') {
          navigate('/comite');
        }


      }
    } catch (error) {
      setError("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.");
      setInputValues({ username: "", password: "" });
    }
  };

  const [showModal, setModalOpen] = useState(false);

  const closeModal = () => {
    setModalOpen(false);
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
                <TextField className="input_user" name="username" id="username" type="text" value={inputValues.username} onChange={handleChange} />
                <p className="texto_correo">Contraseña *</p>
                <TextField name="password" id="password" type="password" value={inputValues.password} onChange={handleChange} />
                <Button style={{ textTransform: "none" }} type="submit" disabled={!usuario.username || !usuario.password}>Iniciar Sesión</Button>
                <p onClick={() => setModalOpen(true)} className="p_recuperar center">Recuperar Contraseña</p>
                <p className="p_propuesta center">Inscribir Propuesta</p>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <Recuperar1 isVisible={showModal} closeModal={closeModal} />
    </Fragment>
  );
};

export default Login;
