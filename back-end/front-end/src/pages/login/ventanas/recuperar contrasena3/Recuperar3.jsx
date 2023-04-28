import React, { useState } from 'react';
import { EyeTwoTone, EyeInvisibleOutlined } from '@ant-design/icons';
import { Button, Modal, Input } from 'antd';
import { TextField, Alert, Snackbar } from "@mui/material";
import "./Recuperar3.css";

export const Recuperar3 = ({ isVisible3, closeModalFunction3 }) => {

    const [isModalVisible, setIsModalVisible] = React.useState(isVisible3);

    React.useEffect(() => {
        setIsModalVisible(isVisible3);
    }, [isVisible3]);

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
        closeModalFunction3();
    };

    React.useEffect(() => {
        if (!isVisible3) {
            setIsPasswordVisible1(false);
            setIsPasswordVisible2(false);
        }
    }, [isVisible3]);

    const [contrasena, setContrasena] = useState({
        contrasena1: "",
        contrasena2: "",
    })

    // Variable del SnackBar
    const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });
    const handleCloseMensaje = () => setMensaje({ tipo: "", texto: "" });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setContrasena({ ...contrasena, [name]: value });
    };

    const handleReset = async (event) => {
        event.preventDefault();
        if (contrasena.contrasena1 !== "" && contrasena.contrasena2 !== "") {
            try {
                const response = await fetch("http://localhost:5000/cambiarContrasena", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(contrasena)
                });

                const data = await response.json();

                if (!data.success) {
                    //setContrasena("");
                    setMensaje({ tipo: "error", texto: data.message });

                    // Contraseña cambiada con éxito
                } else {
                    setMensaje({ tipo: "success", texto: data.message });
                    closeModal3();
                }

            } catch (error) {
                //setCorreo("");
                setMensaje({ tipo: "error", texto: "Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda." });
            }

            // Si el valor de cualquier input es null
        } else {
            //setCorreo("");
            setMensaje({ tipo: "error", texto: "Por favor ingrese los valores requeridos." });
        }

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