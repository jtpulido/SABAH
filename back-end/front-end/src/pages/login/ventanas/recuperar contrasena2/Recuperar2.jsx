import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import { TextField, Alert, Snackbar } from "@mui/material";
import "./Recuperar2.css";
import { Recuperar3 } from "../recuperar contrasena3/Recuperar3"

export const Recuperar2 = ({ isVisible, onClose, closeModal1 }) => {

  const [isModalVisible, setIsModalVisible] = React.useState(isVisible);

  React.useEffect(() => {
    setIsModalVisible(isVisible);
  }, [isVisible]);

  const [visible3, setVisible3] = useState(false);

  const [codigoIngresado, setCodigoIngresado] = useState("");

  const closeModal2 = () => {
    setCodigoIngresado("");
    setIsModalVisible(false);
    onClose();
    closeModal1();
  };

  const closeModal3 = () => {
    setVisible3(false);
    closeModal2();
  };

  const openModal3 = () => {
    setVisible3(true);
  };

  const handleChange = (e) => {
    setCodigoIngresado(e.target.value);
  };

  // Variable del SnackBar
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });
  const handleCloseMensaje = () => setMensaje({ tipo: "", texto: "" });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (codigoIngresado !== "") {
      try {
        const response = await fetch("http://localhost:5000/verificarCodigo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ "codigo": codigoIngresado })
        });

        const data = await response.json();

        if (!data.success) {
          setCodigoIngresado("");
          setMensaje({ tipo: "error", texto: data.message });

          // Si el codigo es el mismo
        } else {
          window.alert(data.message)
          setCodigoIngresado("");
          setMensaje({ tipo: "success", texto: data.message });
          openModal3();
          closeModal2();
        }

      } catch (error) {
        setCodigoIngresado("");
        setMensaje({ tipo: "error", texto: "Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda." });
      }

      // Si el valor es null
    } else {
      setCodigoIngresado("");
      setMensaje({ tipo: "error", texto: "Por favor ingrese un valor válido." });
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
        onCancel={closeModal2}
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
        <Recuperar3 isVisible={visible3} onClose={closeModal3} closeModal2={closeModal2} />
      </Modal>
    </>
  );
};

export default Recuperar2;