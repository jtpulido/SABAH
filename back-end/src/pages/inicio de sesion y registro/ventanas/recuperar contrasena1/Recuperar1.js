import React, { useState } from 'react';
import { Button, Modal, Input } from 'antd';
import 'antd/dist/reset.css';
import "./Recuperar1.css";
import { Recuperar2 } from "../recuperar contrasena2/Recuperar2"

export const Recuperar1 = ({ isVisible, closeModal }) => {

  const [isModalVisible, setIsModalVisible] = React.useState(isVisible);

  React.useEffect(() => {
    setIsModalVisible(isVisible);
  }, [isVisible]);

  /** Segundo modal de recuperar contrasena */
  const [visible2, setVisible2] = useState(false);

  const closeModal1 = () => {
    closeModal();
  };

  const closeModal2 = () => {
    setVisible2(false);
  };

  const openModal2 = () => {
    setVisible2(true);
  };

  return (
    <>
      <Modal
        title="Recuperar Contraseña"
        centered
        open={isModalVisible}
        onCancel={closeModal1}
        footer={null}
        className='modal_recuperar1'
      >
        <div className="div">
          <p className='text'>Ingrese el correo o código del proyecto</p>
        </div>

        <Input className='input'></Input>
        <Button className='boton_enviar' onClick={openModal2}>Enviar Código</Button>
        <Recuperar2 isVisible={visible2} onClose={closeModal2} closeModal1={closeModal1} />
      </Modal>
    </>
  );
};

export default Recuperar1;
