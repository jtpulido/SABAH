import React, { Fragment } from "react";
import "./Login.css";
import logo from "../../assets/images/logo.png";
import logo_ueb from "../../assets/images/logo_ueb.png";
import { Button } from "reactstrap";
import { Recuperar } from "./Recuperar";

export class Login extends React.Component {

  state = {
    abierto: false,
  }

  abrirRecuperar() {
    this.setState({ abierto: !this.state.abierto })
  }

  render() {
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

              <p class="texto_correo">Contraseña *</p>
              <input type="text" id="contrasena" />
              <Button>
                Iniciar Sesión
              </Button>
              <p>Recuperar Contraseña</p>
              <p>Inscribir Propuesta</p>
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

        <Recuperar/>

      </div>
      </Fragment>
    );
  }

}

export default Login;