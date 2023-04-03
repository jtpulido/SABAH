import React, { Fragment, useState } from "react";
import "./Login.css";
import logo from "../../../../assets/images/logo.png";
import logo_ueb from "../../../../assets/images/logo_ueb.png";
import { Button } from "reactstrap";
import { Recuperar1 } from "../recuperar contrasena1/Recuperar1";

export const Login = () => {

  const [showModal, setModalOpen] = useState(false);

  const closeModal = () => {
    setModalOpen(false);
  };

  return (

    <Fragment>
      <div className="todo">
        <div class="container">
          <div class="logo">
            <img src={logo} alt="" />
          </div>

          <div class="login">
            <div class="login_child">
              <p class="texto_correo">Correo o código de proyecto *</p>
              <input type="text" id="correo_codigo" />

              <p class="texto_cont">Contraseña *</p>
              <input type="text" id="contrasena" />
              <Button>Iniciar Sesión</Button>
              <p onClick={() => setModalOpen(true)} className="p_recuperar">Recuperar Contraseña</p>
              <p className="p_propuesta">Inscribir Propuesta</p>
            </div>
          </div>
        </div>

        <div class="footer">
          <footer>
            <div class="copyright">
              <p>
                © 2023 Sistema para la gestión de proyectos - Programa Ingeniería
                de Sistemas, Universidad El Bosque
              </p>
            </div>
            <div class="facultad">
              <p>Facultad de Ingeniería</p>
              <img src={logo_ueb} alt="" />
            </div>
          </footer>
        </div>

        <Recuperar1 isVisible={showModal} closeModal={closeModal} />

      </div>
    </Fragment>
  );
}

export default Login;