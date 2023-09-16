import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import { TextField } from "@mui/material";
import "./Recuperar1.css";
import { Recuperar2 } from "../recuperar contrasena2/Recuperar2";
import { useSnackbar } from 'notistack';

export const Recuperar1 = ({ isVisible, closeModal }) => {
  const apiBaseUrl = process.env.REACT_APP_API_URL;
  // Modal 1
  const [isModalVisible, setIsModalVisible] = React.useState(isVisible);

  const [correo, setCorreo] = useState("");

  // Variable para saber si es un usuario normal o un proyecto
  const [isProyecto, setIsProyecto] = useState(false);

  React.useEffect(() => {
    setIsModalVisible(isVisible);
  }, [isVisible]);

  const handleChange = (e) => {
    setCorreo(e.target.value);
  };

  const handleClose = () => {
    setCorreo("");
    closeModal();
  };

  // Modal 2
  const [visible2, setVisible2] = useState(false);
  const handleClose2 = () => {
    setCorreo("");
    setVisible2(false);
  };

  const handleOpen2 = () => {
    setVisible2(true);
  };

  const { enqueueSnackbar } = useSnackbar();
  const mostrarMensaje = (mensaje, variante) => {
    enqueueSnackbar(mensaje, { variant: variante });
  };

  const handleReset = async (event) => {
    event.preventDefault();
    if (correo !== "") {
      try {
        const response = await fetch(`${apiBaseUrl}/confirmarCorreo`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ "correo": correo })
        });

        const data = await response.json();
        // Si el correo no existe buscar si existe codigo de proyecto
        if (!data.success) {
          try {
            const response = await fetch(`${apiBaseUrl}/login/confirmarCodigo`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ "codigo": correo })
            });

            const data = await response.json();
            // Si existe el proyecto
            if (data.success) {
              mostrarMensaje("El código de proyecto ingresado está registrado en nuestro sistema.", "success");
              setIsProyecto(true);
              try {
                const response2 = await fetch(`${apiBaseUrl}/sendEmails`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(data.correos)
                });

                const data2 = await response2.json();
                // Si no se envío el correo con exito
                if (!data2.success) {
                  setCorreo("");
                  mostrarMensaje(data.message, "error");
                  handleClose();

                  // Si fue enviado con éxito el correo
                } else {
                  mostrarMensaje("Se ha enviado un correo electrónico con el código de verificación.", "success");
                  handleClose();
                  handleOpen2();
                  setCorreo("");
                }
              } catch (error) {
                setCorreo("");
                mostrarMensaje("Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
              }
            } else {
              mostrarMensaje(data.message, "error");
              setCorreo("")
            }
          } catch (error) {
            setCorreo("");
            mostrarMensaje("Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
          }

          // Si el correo si existe
        } else {
          mostrarMensaje("El correo electrónico ingresado está registrado en nuestro sistema.", "success");
          // Enviar codigo de verificacion
          event.preventDefault();
          try {
            const response2 = await fetch(`${apiBaseUrl}/sendEmail`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ correo })
            });

            const data2 = await response2.json();

            // Si no se envío el correo con exito
            if (!data2.success) {
              setCorreo("");
              mostrarMensaje(data.message, "error");
              handleClose();

              // Si fue enviado con éxito el correo
            } else {
              mostrarMensaje("Se ha enviado un correo electrónico con el código de verificación.", "success");
              handleClose();
              handleOpen2();
              setCorreo("");
            }
          } catch (error) {
            setCorreo("");
            mostrarMensaje("Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
          }
        }
      } catch (error) {
        setCorreo("");
        mostrarMensaje("Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
      }

      // Si el valor es null
    } else {
      setCorreo("");
      mostrarMensaje("Por favor ingrese un valor de correo electrónico o código de proyecto válido.", "info");
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
        className='modal_recuperar1'
        style={{ borderRadius: 0 }}
      >
        <div className="div">
          <p className='text'>Ingrese el correo o código del proyecto</p>
        </div>
        <div className="container_input">
          <TextField type="text" name="correo" id="correo" className='input' value={correo} onChange={handleChange}></TextField>
        </div>
        <Button className='boton_enviar' onClick={handleReset}>Enviar Código</Button>
        <Recuperar2 isVisible2={visible2} handleClose2={handleClose2} isProyecto={isProyecto} />
      </Modal>
    </>
  );
};

export default Recuperar1;