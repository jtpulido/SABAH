import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Typography, DialogTitle, Dialog, Button, TextField, DialogActions, Divider, DialogContent } from "@mui/material";
import { SaveOutlined } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useSelector } from 'react-redux';
import { selectToken } from '../../../../store/authSlice';

function CambiarCodigo(props) {
    const apiBaseUrl = process.env.REACT_APP_API_URL;
    const id = sessionStorage.getItem('admin_id_proyecto');
    const token = useSelector(selectToken);

    const { enqueueSnackbar } = useSnackbar();
    const mostrarMensaje = (mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    };

    const { onClose, proyectoCodigo: valueProp, onSubmit, open, ...other } = props;
    const [proyectoCodigo, setProyectoCodigo] = useState(valueProp);

    const [nuevoConsecutivo, setNuevoConsecutivo] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const [modalidad, setModalidad] = useState('');
    const [anio, setAnio] = useState('');
    const [periodo, setPeriodo] = useState('');
    const [consecutivo, setConsecutivo] = useState('');
    const [valido, setValido] = useState(false);
    const [helperText, setHelperText] = useState("No puede modificar la modalidad, el año, ni el periodo.");

    const modificarCodigo = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const nuevoCodigo = `${modalidad}_${anio}-${periodo}-${formatNumber(nuevoConsecutivo)}`;

            const response = await fetch(`${apiBaseUrl}/admin/cambiarCodigo`, {
                method: "POST",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ id: id, codigo: nuevoCodigo })
            });
            const data = await response.json();
            if (data.success) {
                onSubmit(data.codigo)
                mostrarMensaje("Se ha actualizado el código del proyecto", "success");
                setProyectoCodigo('')
                setModalidad('')
                setAnio('')
                setPeriodo('')
                setConsecutivo('')
                setValido(false)
                setHelperText('')
                setNuevoConsecutivo('')
            } else {
                mostrarMensaje(data.message, "error")
            }
        }
        catch (error) {
            mostrarMensaje("Lo sentimos, ha habido un error en la comunicación con el servidor. Por favor, intenta de nuevo más tarde.", "error")
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (proyectoCodigo) {
            const parts = proyectoCodigo.split('_');
            if (parts.length === 2) {
                const codigoPartes = parts[1].split('-');
                if (codigoPartes.length === 3) {
                    setModalidad(parts[0]);
                    setAnio(codigoPartes[0]);
                    setPeriodo(codigoPartes[1]);
                    setConsecutivo(parseInt(codigoPartes[2]));
                }
            }
        }
    }, [proyectoCodigo]);

    const textFieldRef = useRef(null);

    useEffect(() => {
        if (!open) {
            setProyectoCodigo(valueProp);
        }
    }, [valueProp, open]);

    const handleEntering = () => {
        if (textFieldRef.current != null) {
            textFieldRef.current.value = consecutivo !== null ? parseInt(consecutivo) : "";
        }
    };

    const handleCancel = () => {
        onClose();
        setProyectoCodigo('')
        setModalidad('')
        setAnio('')
        setPeriodo('')
        setConsecutivo('')
        setValido(false)
        setHelperText('')
        setNuevoConsecutivo('')
    };

    useEffect(() => {
        setNuevoConsecutivo(consecutivo);
    }, [consecutivo]);

    const formatNumber = (number) => {
        return number.toString().padStart(2, '0');
    };

    const handleConsecutivoChange = (event) => {
        const value = event.target.value;
        setNuevoConsecutivo(value);
        if (parseInt(value) > 0) {
            setValido(true);
            setHelperText("No puede modificar la modalidad, el año, ni el periodo.");
        } else {
            setValido(false);
            setHelperText("El consecutivo de código no debe ser menor a 1.");
        }
    };

    return (
        <Dialog open={open} TransitionProps={{ onEntering: handleEntering }} onClose={handleCancel} {...other} >
            <DialogTitle variant="h1" color="secondary">Asignar código</DialogTitle>
            <DialogContent dividers  >

                <Typography variant="h4" color="primary">
                    Código del proyecto:
                </Typography>
                <Typography variant="h5">
                    {proyectoCodigo}
                </Typography>
                <Divider sx={{ mt: 2, mb: 2 }} />
                <TextField autoFocus
                    ref={textFieldRef}
                    type="number"
                    InputLabelProps={{
                        shrink: true,
                    }}
                    label="Nuevo consecutivo"
                    value={nuevoConsecutivo}
                    onChange={handleConsecutivoChange}
                    helperText={helperText}
                    variant="standard"
                />


            </DialogContent>
            <DialogActions>
                <Button onClick={handleCancel} disabled={isLoading}>
                    Cerrar
                </Button>
                <Button onClick={(e) => modificarCodigo(e)} disabled={!valido || isLoading} variant="contained" startIcon={<SaveOutlined />} sx={{
                    width: 150,
                }}>
                    Guardar
                </Button>
            </DialogActions>

        </Dialog>
    );
}

CambiarCodigo.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
    proyectoCodigo: PropTypes.string.isRequired,
};

export default CambiarCodigo;
