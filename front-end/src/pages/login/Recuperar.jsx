import React from "react";
import "./Recuperar.css";
import { Button, ModalHeader, Input } from "reactstrap"

export const Recuperar = () => {

  return (

    <div className="container">

      <div className="content">

        

        <div className="modal">
        <div className="div_boton_cerrar">
          <Button className="boton_cerrar">X</Button>
        </div>
          <ModalHeader className="header">Recuperar Contraseña</ModalHeader>
          <p>Ingrese el correo o código del proyecto</p>
          <Input className="input"></Input>
          <Button className="boton_enviar">Enviar Código</Button>
        </div>

      </div>

    </div>

  );
};
