import React from "react";
import "./actaReunion.css";
import { Button, ModalHeader, Input } from "reactstrap"

export const actaReunion = ({ isVisible, onClose }) => {

    if (!isVisible) return null

    const handleClose = (e) => {
        if (e.target.id === 'wrapper') onClose()
    }

    return (

        <div className="container" id='wrapper' onClick={handleClose}>

            <div className="content">

                <div className="modal">
                    <ModalHeader className="header">Recuperar Contraseña</ModalHeader>
                    <p>Ingrese el correo o código del proyecto</p>
                    <Input className="input"></Input>
                    <Button className="boton_enviar">Enviar Código</Button>
                </div>

            </div>

        </div>

    );
};
