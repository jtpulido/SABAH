import React from 'react';
import { EyeTwoTone, EyeInvisibleOutlined } from '@ant-design/icons';
import { Button, Modal, Input } from 'antd';
import 'antd/dist/reset.css';
import "./Recuperar3.css";

export const Recuperar3 = ({ isVisible, onClose, closeModal2 }) => {

    const [isModalVisible, setIsModalVisible] = React.useState(isVisible);

    React.useEffect(() => {
        setIsModalVisible(isVisible);
    }, [isVisible]);

    const closeModal3 = () => {
        setIsModalVisible(false);
        onClose();
        closeModal2();
    };

    return (
        <>
            <Modal
                title="Recuperar Contraseña"
                centered
                open={isModalVisible}
                onCancel={closeModal3}
                footer={null}
                className='modal_recuperar3'
            >
                <div className="div">
                    <p className='text'>Ingrese su nueva contraseña</p>
                </div>

                <div className='div_input'>
                <Input.Password placeholder="Nueva contraseña" className='input1' iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)} />
                <Input.Password placeholder="Confirmar contraseña" className='input2' iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)} />
                </div>

                <Button className='boton_enviar'>Cambiar Contraseña</Button>
            </Modal>
        </>
    );
};

export default Recuperar3;
