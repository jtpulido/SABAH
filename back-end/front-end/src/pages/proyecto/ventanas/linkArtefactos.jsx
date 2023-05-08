import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import { TextField, Alert, Snackbar } from "@mui/material";

export const linkArtefactos = ({ isVisible, closeModal }) => {

  // Modal 1
  const [isModalVisible, setIsModalVisible] = React.useState(isVisible);

  const [link, setLink] = useState("");

  React.useEffect(() => {
    setIsModalVisible(isVisible);
  }, [isVisible]);

  // Modal 2
  const [visible2, setVisible2] = useState(false);

  const closeModal2 = () => {
    setVisible2(false);
  };

  const handleChange = (e) => {
    setLink(e.target.value);
  };

  // Variable del SnackBar
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });
  const handleCloseMensaje = () => setMensaje({ tipo: "", texto: "" });

  const handleReset = async (event) => {
    event.preventDefault();
    if (correo !== "") {
      try {
        const response = await fetch(`http://localhost:5000/proyecto/verProyecto/${cookies.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ "link": link })
        });

        const data = await response.json();

        // Si no el correo no existe u otro error
        if (!data.success) {
          setMensaje({ tipo: "error", texto: data.message });
          setCorreo("")

          // Si el correo si existe
        } else {
          setMensaje({ tipo: "success", texto: "Link agregado correctamente." });

          // Enviar codigo de verificacion
          try {

            const response2 = await fetch("http://localhost:5000/", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ link })
            });

            const data2 = await response2.json();

            // Si no se envío el correo con exito
          } catch (error) {
            setCorreo("");
            setMensaje({ tipo: "error", texto: "Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda." });
          }

        }

      } catch (error) {

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
      <Modal
        title="Artefactos De Control"
        centered
        open={isModalVisible}
        onCancel={closeModal}
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
        <Button className='boton_enviar' onClick={handleReset}>Guardar Link</Button>
      </Modal>
    </>
  );
};

export default Recuperar1;