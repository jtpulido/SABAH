import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import { TextField, Alert, Snackbar } from "@mui/material";
import "./Recuperar1.css";
import { Recuperar2 } from "../recuperar contrasena2/Recuperar2"

export const Recuperar1 = ({ isVisible, closeModal }) => {

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

  const esperar = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  // Variable del SnackBar
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });
  const handleCloseMensaje = () => setMensaje({ tipo: "", texto: "" });

  const handleReset = async (event) => {
    event.preventDefault();
    if (correo !== "") {
      try {
        const response = await fetch("http://localhost:5000/confirmarCorreo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ "correo": correo })
        });

        const data = await response.json();
        // Si el correo no existe buscar si existe codigo de proyecto
        if (!data.success) {
          try {
            const response = await fetch("http://localhost:5000/login/confirmarCodigo", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ "codigo": correo })
            });

            const data = await response.json();
            // Si existe el proyecto
            if (data.success) {
              setMensaje({ tipo: "success", texto: "El código de proyecto ingresado está registrado en nuestro sistema." });
              setIsProyecto(true);
              try {
                const response2 = await fetch("http://localhost:5000/sendEmails", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(data.correos)
                });

                const data2 = await response2.json();
                // Si no se envío el correo con exito
                if (!data2.success) {
                  setCorreo("");
                  setMensaje({ tipo: "error", texto: data.message });
                  await esperar(1500);
                  handleClose();

                  // Si fue enviado con éxito el correo
                } else {
                  setMensaje({ tipo: "success", texto: "Se ha enviado un correo electrónico con el código de verificación." });
                  await esperar(2000);
                  handleClose();
                  handleOpen2();
                  setCorreo("");
                }
              } catch (error) {
                setCorreo("");
                setMensaje({ tipo: "error", texto: "Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda." });
              }

            } else {
              setMensaje({ tipo: "error", texto: data.message });
              setCorreo("")
            }
          } catch (error) {
            setCorreo("");
            setMensaje({ tipo: "error", texto: "Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda." });
          }

          // Si el correo si existe
        } else {
          setMensaje({ tipo: "success", texto: "El correo electrónico ingresado está registrado en nuestro sistema." });
          // Enviar codigo de verificacion
          event.preventDefault();
          try {
            const response2 = await fetch("http://localhost:5000/sendEmail", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ correo })
            });

            const data2 = await response2.json();

            // Si no se envío el correo con exito
            if (!data2.success) {
              setCorreo("");
              setMensaje({ tipo: "error", texto: data.message });
              handleClose();

              // Si fue enviado con éxito el correo
            } else {
              setMensaje({ tipo: "success", texto: "Se ha enviado un correo electrónico con el código de verificación." });
              await esperar(2000);
              handleClose();
              handleOpen2();
              setCorreo("");
            }
          } catch (error) {
            setCorreo("");
            setMensaje({ tipo: "error", texto: "Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda." });
          }
        }
      } catch (error) {
        setCorreo("");
        setMensaje({ tipo: "error", texto: "Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda." });
      }

      // Si el valor es null
    } else {
      setCorreo("");
      setMensaje({ tipo: "error", texto: "Por favor ingrese un valor de correo electrónico o código de proyecto válido." });
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
        {mensaje.texto && (
          <Snackbar
            open={true}
            autoHideDuration={5000}
            onClose={handleCloseMensaje}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert severity={mensaje.tipo} onClose={handleCloseMensaje}>
              {mensaje.texto}
            </Alert>
          </Snackbar>
        )}
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