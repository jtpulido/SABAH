import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import { TextField, Alert, Snackbar } from "@mui/material";
import "./Recuperar1.css";
import { Recuperar2 } from "../recuperar contrasena2/Recuperar2"

export const Recuperar1 = ({ isVisible, closeModal }) => {

  const [isModalVisible, setIsModalVisible] = React.useState(isVisible);

  React.useEffect(() => {
    setIsModalVisible(isVisible);
  }, [isVisible]);

  /** Segundo modal de recuperar contrasena */
  const [visible2, setVisible2] = useState(false);

  const [correo, setCorreo] = useState("");

  const closeModal1 = () => {
    setCorreo("");
    closeModal();
  };

  const closeModal2 = () => {
    setVisible2(false);
  };

  const openModal2 = () => {
    setVisible2(true);
  };

  const handleChange = (e) => {
    setCorreo(e.target.value);
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

        if (!data.success) {
          setCorreo("");
          setMensaje({ tipo: "error", texto: data.message });

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

            if (!data2.success) {
              setCorreo("");
              setMensaje({ tipo: "error", texto: data.message });
              closeModal1();
              closeModal2();

              // Si fue enviado con éxito el correo
            } else {
              setMensaje({ tipo: "success", texto: "Se ha enviado un correo electrónico con el código de verificación." });
              setCorreo("");
              openModal2();
              closeModal1();
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
      setMensaje({ tipo: "error", texto: "Por favor ingrese un valor de correo electrónico válido." });
    }

  };

  return (
    <>
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

      <Modal
        title="Recuperar Contraseña"
        centered
        open={isModalVisible}
        onCancel={closeModal1}
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
        <Recuperar2 isVisible={visible2} onClose={closeModal2} closeModal1={closeModal1} />
      </Modal>
    </>
  );
};

export default Recuperar1;