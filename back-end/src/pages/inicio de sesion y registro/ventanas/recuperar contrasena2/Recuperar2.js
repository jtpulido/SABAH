import React, { useState } from 'react';
import { Button, Modal, Input } from 'antd';
import 'antd/dist/reset.css';
import "./Recuperar2.css";
import { Recuperar3 } from "../recuperar contrasena3/Recuperar3"

export const Recuperar2 = ({ isVisible, onClose, closeModal1 }) => {

  const [isModalVisible, setIsModalVisible] = React.useState(isVisible);

  React.useEffect(() => {
    setIsModalVisible(isVisible);
  }, [isVisible]);

  const [visible3, setVisible3] = useState(false);

  const closeModal2 = () => {
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


  return (
    <>
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

        <Input className='input'></Input>
        <Button className='boton_enviar' onClick={openModal3}>Cambiar Contraseña</Button>
        <Recuperar3 isVisible={visible3} onClose={closeModal3} closeModal2={closeModal2} />
      </Modal>
    </>
  );
};

export default Recuperar2;
