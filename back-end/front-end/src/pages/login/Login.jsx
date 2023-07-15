import React, { Fragment, useState, useCallback } from "react";
import { useCookies } from 'react-cookie';
import Footer from "../pie_de_pagina/Footer"
import "./Login.css";
import logo from "../../assets/images/logo.png";
import { TextField, Alert, Snackbar } from "@mui/material";
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Recuperar1 } from '../login/ventanas/recuperar contrasena1/Recuperar1';

export const Login = () => {

  // eslint-disable-next-line no-unused-vars
  const [cookies, setCookie] = useCookies(['token', 'tipo_usuario', 'usuario']);
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

  const handleInscription = () => {
    navigate("/inscribirPropuesta");
  }

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    if (usuario.username !== "" && usuario.password !== "") {
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
          setInputValues({ username: "", password: "" });
          const expires = new Date();
          expires.setTime(expires.getTime() + (2 * 60 * 60 * 1000)); // caduca en dos horas

          setCookie('token', data.token, { path: '/', expires });
          setCookie('tipo_usuario', data.tipo_usuario, { path: '/', expires });

          const tipo_usuario = data.tipo_usuario;
          const id_usuario = data.id_usuario;

          if (tipo_usuario === 'admin') {
            navigate('/admin');
          } else if (tipo_usuario === 'normal') {
            sessionStorage.setItem('id_usuario', id_usuario);
            navigate('/user');
          } else if (tipo_usuario === 'comite') {
            navigate('/comite');
          } else if (tipo_usuario === 'proyecto') {
            navigate('/proyecto', { state: { id_usuario } });
          }

        }
      } catch (error) {
        setError("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.");
        setInputValues({ username: "", password: "" });
      }
    } else {
      setInputValues({ username: "", password: "" });
      setError("Por favor ingrese valores válidos.");
    }
  }, [usuario, navigate, setCookie]);

  // Modal 1
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
              <p className="texto_correo">Correo o código de proyecto *</p>
              <TextField name="username" id="username" type="text" value={inputValues.username} onChange={handleChange} />
              <p className="texto_correo">Contraseña *</p>
              <TextField name="password" id="password" type="password" value={inputValues.password} onChange={handleChange} />
              <Button type="submit" onClick={handleSubmit}>Iniciar Sesión</Button>
              <p onClick={() => setModalOpen(true)} className="p_recuperar center">Recuperar Contraseña</p>
              <p className="p_propuesta center" onClick={handleInscription}>Inscribir Propuesta</p>
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
