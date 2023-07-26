import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { selectToken } from '../../../store/authSlice';
import {
    CircularProgress,
    Box,
    TextField,
    CssBaseline,
    Button,
    DialogTitle,
    Dialog,
    DialogActions,
    DialogContent,
    IconButton,
    Typography,
    Select,
    MenuItem
} from '@mui/material';

import { useSnackbar } from 'notistack';
import { Edit, SaveOutlined } from '@mui/icons-material';

function VerModificarUsuario(props) {
    const { onClose, onSubmit, open, informacion, rol } = props;
    const { enqueueSnackbar } = useSnackbar();

    const token = useSelector(selectToken);
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cambio, setCambio] = useState(false);
    const [id_rol, setId_rol] = useState("");

    const mostrarMensaje = (mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    };

    const handleEntering = async () => {
        console.log(informacion);
        obtenerUsuarios()
        setLoading(false);
    };
    useEffect(() => {
        if (usuarios.length > 0 && informacion.id_usuario) {
            setId_rol(informacion.id_usuario)
            setLoading(false);
        }
    }, [usuarios, informacion.id_usuario]);

    const handleCancel = () => {
        onClose();
        setLoading(true);
    };
    const handleIdRolChange = (event) => {
        if (informacion.id_usuario !== event.target.value) {
            setId_rol(event.target.value);
            setCambio(true)
        } else {
            setCambio(false)
        }
    };
    const cambiarUsuarioRol = async () => {

console.log("Cambiar");
    }
    const asignarUsuarioRol = async () => {
        console.log("Asignar");

    }
    const guardarCambio = async () => {
        if (informacion.id_usuario) {
            cambiarUsuarioRol()
        } else {
            asignarUsuarioRol()
        }

    }
    const obtenerUsuarios = async () => {
        try {
            const response = await fetch("http://localhost:5000/comite/usuarios", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error");
            } else if (response.status === 203) {
                mostrarMensaje(data.message, "warning");
            } else if (response.status === 200) {
                setUsuarios(data.usuarios);
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error al obtener los usuarios. Por favor, intente de nuevo más tarde.", "error");
        }
    }
    return (
        <Dialog open={open} fullWidth maxWidth="sm" onClose={handleCancel} TransitionProps={{ onEntering: handleEntering }} >
            <CssBaseline />
            <DialogTitle variant="h1" color="primary">
                VER/MODIFICAR {rol}


            </DialogTitle>
            <form onSubmit={guardarCambio}>
                <DialogContent dividers>

                    {loading || usuarios.length === 0 ? (
                        <Box sx={{ display: 'flex' }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <Typography variant="h6" color="primary">
                                Docentes
                            </Typography>
                            <Select
                                value={id_rol}
                                onChange={handleIdRolChange}
                                required

                                fullWidth
                            >
                                {usuarios.map((user) => (
                                    <MenuItem key={user.id} value={user.id}>
                                        {user.nombre}
                                    </MenuItem>
                                ))}
                            </Select>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancel}>Cerrar</Button>
                    <Button type="submit" variant="contained" disabled={!cambio} startIcon={<SaveOutlined />} sx={{
                        width: 150,
                    }}>
                        Guardar
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

VerModificarUsuario.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
    informacion: PropTypes.object.isRequired,
    rol: PropTypes.string.isRequired,
    accion: PropTypes.string.isRequired
};

export default VerModificarUsuario;
