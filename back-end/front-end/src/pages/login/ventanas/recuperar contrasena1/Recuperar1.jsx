import React, { useState } from 'react';
import { Button, Modal, Input } from 'antd';
import { Alert, Snackbar } from "@mui/material";
import "./Recuperar1.css";
import { Recuperar2 } from "../recuperar contrasena2/Recuperar2"

export const Recuperar1 = ({ isVisible, closeModal }) => {

  const [isModalVisible, setIsModalVisible] = React.useState(isVisible);

  React.useEffect(() => {
    setIsModalVisible(isVisible);
  }, [isVisible]);

  /** Segundo modal de recuperar contrasena */
  const [visible2, setVisible2] = useState(false);

  const [inputValue, setInputValue] = useState(null);

  const closeModal1 = () => {
    setInputValue(null);
    closeModal();
  };

  const closeModal2 = () => {
    setVisible2(false);
  };

  const openModal2 = () => {
    setVisible2(true);
  };

  const [error, setError] = useState(null);
  const handleClose = () => setError(null);

  return (
    <>
      {error && (
          <Snackbar open={true} autoHideDuration={6000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
            <Alert severity="error" onClose={handleClose}>
              {error}
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

        <Input className='input' value={inputValue} onChange={(e) => setInputValue(e.target.value)}></Input>
        <Button className='boton_enviar' onClick={openModal2}>Enviar Código</Button>
        <Recuperar2 isVisible={visible2} onClose={closeModal2} closeModal1={closeModal1} />
      </Modal>
    </>
  );
};

export default Recuperar1;