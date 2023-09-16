import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import { TextField } from "@mui/material";
import "./Recuperar2.css";
import { Recuperar3 } from "../recuperar contrasena3/Recuperar3";
import { useSnackbar } from 'notistack';

export const Recuperar2 = ({ isVisible2, handleClose2, isProyecto }) => {
  const apiBaseUrl = process.env.REACT_APP_API_URL;
  const [isModalVisible, setIsModalVisible] = React.useState(isVisible2);
  const [isProyecto2, setIsProyecto2] = React.useState(isProyecto);

  const [codigoIngresado, setCodigoIngresado] = useState("");

  // Tercer modal de recuperar contrasena
  const [visible3, setVisible3] = useState(false);

  const handleClose3 = () => {
    setCodigoIngresado("");
    setVisible3(false);
  };

  const handleOpen3 = () => {
    setVisible3(true);
  };

  const handleChange = (e) => {
    setCodigoIngresado(e.target.value);
  };

  const handleClose = () => {
    setCodigoIngresado("");
    setIsModalVisible(false);
    handleClose2();
  };

  const { enqueueSnackbar } = useSnackbar();
  const mostrarMensaje = (mensaje, variante) => {
    enqueueSnackbar(mensaje, { variant: variante });
  };

  React.useEffect(() => {
    setIsModalVisible(isVisible2);
  }, [isVisible2]);

  React.useEffect(() => {
    setIsProyecto2(isProyecto);
  }, [isProyecto]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (codigoIngresado !== "") {
      try {
        const response = await fetch(`${apiBaseUrl}/verificarCodigo`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ "codigo": codigoIngresado })
        });

        const data = await response.json();
        if (!data.success) {
          setCodigoIngresado("");
          mostrarMensaje(data.message, "error");

          // Si el codigo es el mismo
        } else {
          mostrarMensaje(data.message, "success");
          handleClose();
          setCodigoIngresado("");
          handleOpen3();
        }

      } catch (error) {
        setCodigoIngresado("");
        mostrarMensaje("Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
      }

      // Si el valor es null
    } else {
      setCodigoIngresado("");
      mostrarMensaje("Por favor ingrese un valor válido.", "error");
    }
  };

  return (
    <>
      <Modal
        title="Recuperar Contraseña"
        centered
        open={isModalVisible}
        onCancel={handleClose}
        footer={null}
        className='modal_recuperar2'
      >
        <div className="div">
          <p className='text'>Ingrese el código enviado a su correo</p>
        </div>
        <div className="container_input">
          <TextField type="text" name="codigoIngresado" id="codigoIngresado" className='input' value={codigoIngresado} onChange={handleChange}></TextField>
        </div>
        <Button className='boton_enviar' onClick={handleSubmit}>Cambiar Contraseña</Button>
      </Modal>
      <Recuperar3 isVisible3={visible3} handleClose3={handleClose3} isProyecto2={isProyecto2} />
    </>
  );
};

export default Recuperar2;