import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import { TextField, Alert, Snackbar } from "@mui/material";
import "./Recuperar2.css";
import { Recuperar3 } from "../recuperar contrasena3/Recuperar3"

export const Recuperar2 = ({ isVisible2, closeModal2 }) => {

  const [isModalVisible, setIsModalVisible] = React.useState(isVisible2);

  React.useEffect(() => {
    setIsModalVisible(isVisible2);
  }, [isVisible2]);

  // Tercer modal de recuperar contrasena
  const [visible3, setVisible3] = useState(false);

  const [codigoIngresado, setCodigoIngresado] = useState("");

  const closeModalFunction3 = () => {
    setVisible3(false);
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
          setCodigoIngresado("");
          setMensaje({ tipo: "success", texto: data.message });
          //closeModal2();
          setIsModalVisible(false);
          openModal3();
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
      <Modal
        title="Recuperar Contraseña"
        centered
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        className='modal_recuperar2'
      >

        {mensaje.texto && (
          <Snackbar
            open={true}
            autoHideDuration={5000}
            onClose
            ={handleCloseMensaje}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert severity={mensaje.tipo} onClose={handleCloseMensaje}>
              {mensaje.texto}
            </Alert>
          </Snackbar>
        )}

        <div className="div">
          <p className='text'>Ingrese el código enviado a su correo</p>
        </div>
        <div className="container_input">
          <TextField type="text" name="codigoIngresado" id="codigoIngresado" className='input' value={codigoIngresado} onChange={handleChange}></TextField>
        </div>
        <Button className='boton_enviar' onClick={handleSubmit}>Cambiar Contraseña</Button>
        <Recuperar3 isVisible3={visible3} closeModal={closeModalFunction3} />
      </Modal>
    </>
  );
};

export default Recuperar2;