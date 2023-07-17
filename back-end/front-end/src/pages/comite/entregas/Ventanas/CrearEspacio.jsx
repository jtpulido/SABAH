import React, { useState, useEffect } from 'react';

import { tokens } from "../../../../theme";
import PropTypes from 'prop-types';
import { useTheme, TextField, Button, Select, MenuItem, Dialog, Typography, Slide, DialogContent, DialogTitle, DialogActions, Grid } from "@mui/material";
import { SaveOutlined } from '@mui/icons-material';

import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function CrearEspacio(props) {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const { onClose, roles: rolesvalueProp = [], modalidades: modalidadesvalueProp = [], etapas: etapasvalueProp = [], rubricas: rubricasvalueProp = [], open, ...other } = props;

    const [roles, setRoles] = useState(rolesvalueProp);
    const [modalidades, setModalidades] = useState(modalidadesvalueProp);
    const [etapas, setEtapas] = useState(etapasvalueProp);
    const [rubricas, setRubricas] = useState(rubricasvalueProp);

    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [fechaApertura, setFechaApertura] = useState(dayjs());
    const [fechaCierre, setFechaCierre] = useState(dayjs());
    const [idRol, setIdRol] = useState("");
    const [idModalidad, setIdModalidad] = useState("");
    const [idEtapa, setIdEtapa] = useState("");
    const [idRubrica, setIdRubrica] = useState("");

    const handleNombreChange = (event) => {
        const value = event.target.value;
        const isOnlyWhitespace = /^\s*$/.test(value);
        setNombre(isOnlyWhitespace ? "" : value);
    };

    const handleDescripcionChange = (event) => {
        const value = event.target.value;
        const isOnlyWhitespace = /^\s*$/.test(value);
        setDescripcion(isOnlyWhitespace ? "" : value);
    };

    const handleIdRolChange = (event) => {
        setIdRol(event.target.value);
    };

    const handleIdModalidadChange = (event) => {
        setIdModalidad(event.target.value);
    };

    const handleIdEtapaChange = (event) => {
        setIdEtapa(event.target.value);
    };

    const handleIdRubricaChange = (event) => {
        setIdRubrica(event.target.value);
    };

    const [error, setError] = useState(null);
    const menError = () => setError(null);

    const guardarEspacio = (event) => {
        event.preventDefault();
        const today = dayjs();
        const fechaAperturaDate = dayjs(fechaApertura);
        const fechaCierreDate = dayjs(fechaCierre);

        if (fechaAperturaDate.isBefore(today, 'day')) {
            setError("La fecha de apertura debe ser mayor o igual a la fecha actual.");
            return;
        }

        if (fechaCierreDate.isBefore(fechaAperturaDate, 'day')) {
            setError("La fecha de cierre debe ser mayor a la fecha de apertura.");
            return;
        }
        const espacioData = {
            nombre,
            descripcion,
            fecha_apertura: fechaApertura.format("DD/MM/YYYY hh:mm A"),
            fecha_cierre: fechaCierre.format("DD/MM/YYYY hh:mm A"),
            id_rol: idRol,
            id_modalidad: idModalidad,
            id_etapa: idEtapa,
            id_rubrica: idRubrica,
        };
        onClose(espacioData);
        setNombre("");
        setDescripcion("");
        setFechaApertura(dayjs());
        setFechaCierre(dayjs());
        setIdRol("");
        setIdModalidad("");
        setIdEtapa("");
        setIdRubrica("");
        setError("")
    };

    useEffect(() => {
        if (!open) {
            setRoles(rolesvalueProp)
            setModalidades(modalidadesvalueProp)
            setRubricas(rubricasvalueProp)
            setEtapas(etapasvalueProp)
        }
    }, [rolesvalueProp, modalidadesvalueProp, rubricasvalueProp, etapasvalueProp, open]);


    const handleCancel = () => {
        onClose();
        setNombre("");
        setDescripcion("");
        setFechaApertura(dayjs());
        setFechaCierre(dayjs());
        setIdRol("");
        setIdModalidad("");
        setIdEtapa("");
        setIdRubrica("");
        setError("")
    };
    return (

        <Dialog maxWidth="md" fullWidth TransitionComponent={Transition} open={open} {...other}>
            <form onSubmit={guardarEspacio}>
                <DialogTitle variant="h1" color={colors.primary[100]}>
                    CREAR ESPACIO
                </DialogTitle>

                <DialogContent dividers >
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="h6" color={colors.primary[100]}>
                                Nombre
                            </Typography>
                            <TextField
                                value={nombre}
                                onChange={handleNombreChange}
                                required
                                fullWidth
                                error={!nombre}
                                helperText={'Ingresa el nombre del espacio'} />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="h6" color={colors.primary[100]}>
                                Descripción
                            </Typography>
                            <TextField
                                value={descripcion}
                                onChange={handleDescripcionChange}
                                multiline
                                rows={2}
                                required
                                fullWidth
                                error={!descripcion}
                                helperText={'Ingresa la descripción del espacio'}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="h6" color={colors.primary[100]}>
                                Fecha de apertura
                            </Typography>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateTimePicker
                                    value={fechaApertura}
                                    onChange={(newValue) => setFechaApertura(newValue)}
                                    required
                                    format="DD/MM/YYYY hh:mm A"
                                    fullWidth
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="h6" color={colors.primary[100]}>
                                Fecha de cierre
                            </Typography>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateTimePicker
                                    value={fechaCierre}
                                    onChange={(newValue) => setFechaCierre(newValue)}
                                    required
                                    format="DD/MM/YYYY hh:mm A"
                                    fullWidth
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="h6" color={colors.primary[100]}>
                                Rol Calificador
                            </Typography>
                            <Select
                                value={idRol}
                                onChange={handleIdRolChange}
                                required
                                fullWidth
                            >
                                {roles.map((rol) => (
                                    <MenuItem key={rol.id} value={rol.id}>
                                        {rol.nombre}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="h6" color={colors.primary[100]}>
                                Modalidad
                            </Typography>
                            <Select
                                value={idModalidad}
                                onChange={handleIdModalidadChange}
                                required
                                fullWidth
                            >   {modalidades.map((modalidad) => (
                                <MenuItem key={modalidad.id} value={modalidad.id}>
                                    {modalidad.nombre}
                                </MenuItem>
                            ))}
                            </Select>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="h6" color={colors.primary[100]}>
                                Etapa
                            </Typography>
                            <Select
                                value={idEtapa}
                                onChange={handleIdEtapaChange}
                                required
                                fullWidth
                            >
                                {etapas.map((etapa) => (
                                    <MenuItem key={etapa.id} value={etapa.id}>
                                        {etapa.nombre}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="h6" color={colors.primary[100]}>
                                Rubrica
                            </Typography>
                            <Select
                                value={idRubrica}
                                onChange={handleIdRubricaChange}
                                required
                                fullWidth
                            >
                                {rubricas.map((rubrica) => (
                                    <MenuItem key={rubrica.id} value={rubrica.id}>
                                        {rubrica.nombre}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancel}>Cerrar</Button>
                    <Button type="submit" variant="contained"  startIcon={<SaveOutlined />} >
                        Guardar
                    </Button>
                </DialogActions>
            </form>
        </Dialog>

    );
}
CrearEspacio.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    roles: PropTypes.array.isRequired,
    modalidades: PropTypes.array.isRequired,
    etapas: PropTypes.array.isRequired,
    rubricas: PropTypes.array.isRequired,
};

export default CrearEspacio;