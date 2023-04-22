import React, { useState } from 'react';
import { EyeTwoTone, EyeInvisibleOutlined } from '@ant-design/icons';
import { Button, Modal, Input } from 'antd';
import "./Recuperar3.css";

export const Recuperar3 = ({ isVisible, onClose, closeModal2 }) => {

    const [isModalVisible, setIsModalVisible] = React.useState(isVisible);

    React.useEffect(() => {
        setIsModalVisible(isVisible);
    }, [isVisible]);

    const [inputValue1, setInputValue1] = useState(null);
    const [inputValue2, setInputValue2] = useState(null);

    const [isPasswordVisible1, setIsPasswordVisible1] = useState(false);
    const [isPasswordVisible2, setIsPasswordVisible2] = useState(false);

    const closeModal3 = () => {
        setInputValue1(null);
        setInputValue2(null);

        setIsPasswordVisible1(false);
        setIsPasswordVisible2(false);

        setIsModalVisible(false);
        onClose();
        closeModal2();
    };

    React.useEffect(() => {
        if (!isVisible) {
            setIsPasswordVisible1(false);
            setIsPasswordVisible2(false);
        }
    }, [isVisible]);

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
                    <Input.Password
                        placeholder="Nueva contraseña"
                        className='input1'
                        iconRender={(visible) => (
                            visible ?
                                <EyeTwoTone onClick={() => setIsPasswordVisible1(!isPasswordVisible1)} /> :
                                <EyeInvisibleOutlined onClick={() => setIsPasswordVisible1(!isPasswordVisible1)} />
                        )}
                        value={inputValue1}
                        onChange={(e) => setInputValue1(e.target.value)}
                        type={isPasswordVisible1 ? 'text' : 'password'}
                    />
                    <Input.Password
                        placeholder="Confirmar contraseña"
                        className='input2'
                        iconRender={(visible) => (
                            visible ?
                                <EyeTwoTone onClick={() => setIsPasswordVisible2(!isPasswordVisible2)} /> :
                                <EyeInvisibleOutlined onClick={() => setIsPasswordVisible2(!isPasswordVisible2)} />
                        )}
                        value={inputValue2}
                        onChange={(e) => setInputValue2(e.target.value)}
                        type={isPasswordVisible2 ? 'text' : 'password'}
                    />
                </div>

                <Button className='boton_enviar'>Cambiar Contraseña</Button>
            </Modal>
        </>
    );
};

export default Recuperar3;