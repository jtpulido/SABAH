import React from 'react';

import "./Footer.css";
import logo_ueb from "../../assets/images/logo_ueb.png";

function Footer() {
  return (

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

  );
}

export default Footer;
