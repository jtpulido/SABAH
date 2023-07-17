import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { tokens } from "../../../../theme";
import { Typography, useTheme, CssBaseline, DialogTitle, Dialog, Button, TextField, DialogActions, Divider, DialogContent } from "@mui/material";

function CambiarCodigo(props) {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const { onClose, proyectoCodigo: valueProp, open, ...other } = props;
    const [proyectoCodigo, setProyectoCodigo] = useState(valueProp);

    const [nuevoConsecutivo, setNuevoConsecutivo] = useState("");

    const [modalidad, setModalidad] = useState('');
    const [anio, setAnio] = useState('');
    const [periodo, setPeriodo] = useState('');
    const [consecutivo, setConsecutivo] = useState('');
    const [valido, setValido] = useState(false);
    const [helperText, setHelperText] = useState("No puede modificar la modalidad, el año, ni el periodo.");

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

    const handleOk = () => {
        const nuevoCodigo = `${modalidad}_${anio}-${periodo}-${formatNumber(nuevoConsecutivo)}`;
        onClose(nuevoCodigo);
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
        <Dialog open={open} TransitionProps={{ onEntering: handleEntering }}  {...other} >
            <CssBaseline />

            <DialogTitle variant="h1" color={colors.secundary[100]}>Asignar código</DialogTitle>
            <DialogContent dividers  >

                <Typography variant="h4" color={colors.primary[100]}>
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
                <Button onClick={handleCancel}>
                    Cancelar
                </Button>
                <Button onClick={handleOk} disabled={!valido}>Guardar</Button>
            </DialogActions>

        </Dialog>
    );
}

CambiarCodigo.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    proyectoCodigo: PropTypes.string.isRequired,
};

export default CambiarCodigo;
