import React, { useState } from 'react';
import "./Recuperar3.css";
import { EyeTwoTone, EyeInvisibleOutlined } from '@ant-design/icons';
import { Button, Modal, Input } from 'antd';
import { useSnackbar } from 'notistack';

export const Recuperar3 = ({ isVisible3, handleClose3, isProyecto2 }) => {

    const [isModalVisible, setIsModalVisible] = React.useState(isVisible3);
    const [isPasswordVisible1, setIsPasswordVisible1] = useState(false);
    const [isPasswordVisible2, setIsPasswordVisible2] = useState(false);

    const [isProyecto3, setIsProyecto3] = React.useState(isProyecto2);

    const handleClose = () => {
        setIsPasswordVisible1(false);
        setIsPasswordVisible2(false);
        setInputValue1('');
        setInputValue2('');
        setIsModalVisible(false);
        handleClose3();
    };

    const [contrasena, setContrasena] = useState({
        contrasena1: "",
        contrasena2: "",
    })

    const [inputValue1, setInputValue1] = useState('');
    const [inputValue2, setInputValue2] = useState('');

    React.useEffect(() => {
        setIsModalVisible(isVisible3);
    }, [isVisible3]);

    React.useEffect(() => {
        setIsProyecto3(isProyecto2);
    }, [isProyecto2]);

    const { enqueueSnackbar } = useSnackbar();
    const mostrarMensaje = (mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setContrasena({ ...contrasena, [name]: value });
        if (name === 'contrasena1') {
            setInputValue1(value);
        } else if (name === 'contrasena2') {
            setInputValue2(value);
        }
    };

    const handleReset = async (event) => {
        event.preventDefault();
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@#$%^&+=!])([A-Za-z\d@#$%^&+=!]){8,}$/;

        if (inputValue1 !== "" && inputValue2 !== "") {
            if (inputValue1 !== inputValue2) {
                mostrarMensaje("Las contraseñas no coinciden. Por favor, inténtelo de nuevo.", "error");
            } else if (!passwordRegex.test(inputValue1)) {
                mostrarMensaje("La contraseña debe tener al menos 8 caracteres, incluir al menos una letra y un número.", "error");
            } else {
                // Si es un proyecto
                if (isProyecto3 === true) {
                    try {
                        const response = await fetch("http://localhost:5000/cambiarContrasenaProyecto", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ contrasena: inputValue1 })
                        });

                        const data = await response.json();
                        if (!data.success) {
                            mostrarMensaje(data.message, "error");
                            handleClose();
                        } else {
                            mostrarMensaje(data.message, "success");
                            handleClose();
                        }
                    } catch (error) {
                        mostrarMensaje("Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
                        handleClose();
                    }

                    // Si es un usuario normal
                } else {
                    try {
                        const response = await fetch("http://localhost:5000/cambiarContrasena", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ contrasena: inputValue1 })
                        });

                        const data = await response.json();
                        if (!data.success) {
                            mostrarMensaje(data.message, "error");
                            handleClose();
                        } else {
                            mostrarMensaje(data.message, "success");
                            handleClose();
                        }
                    } catch (error) {
                        mostrarMensaje("Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
                        handleClose();
                    }
                }
            }
        } else {
            mostrarMensaje("Por favor ingrese los valores requeridos.", "error");
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
                className='modal_recuperar3'
            >
                <div className="div">
                    <p className='text2'>La contraseña debe tener al menos 8 caracteres, incluir al menos una letra, un número y un carácter especial.</p>
                </div>

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
                        name="contrasena1"
                        value={inputValue1}
                        onChange={handleChange}
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
                        name="contrasena2"
                        value={inputValue2}
                        onChange={handleChange}
                        type={isPasswordVisible2 ? 'text' : 'password'}
                    />
                </div>

                <Button className='boton_enviar' onClick={handleReset}>Cambiar Contraseña</Button>
            </Modal>
        </>
    );
};

export default Recuperar3;