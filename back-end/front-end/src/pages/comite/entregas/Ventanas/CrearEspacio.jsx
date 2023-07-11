import React, { useState, useEffect } from 'react';

import { tokens } from "../../../../theme";
import PropTypes from 'prop-types';
import { useTheme, TextField, Button, Box, Select, MenuItem, Alert, Dialog, AppBar, Toolbar, Typography, Slide, IconButton } from "@mui/material";

import CloseIcon from '@mui/icons-material/Close';
import { SaveOutlined } from '@mui/icons-material';

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
    const [fechaApertura, setFechaApertura] = useState("");
    const [fechaCierre, setFechaCierre] = useState("");
    const [idRol, setIdRol] = useState("");
    const [idModalidad, setIdModalidad] = useState("");
    const [idEtapa, setIdEtapa] = useState("");
    const [idRubrica, setIdRubrica] = useState("");

    const handleNombreChange = (event) => {
        setNombre(event.target.value);
    };

    const handleDescripcionChange = (event) => {
        setDescripcion(event.target.value);
    };

    const handleFechaAperturaChange = (event) => {
        setFechaApertura(event.target.value);
    };

    const handleFechaCierreChange = (event) => {
        setFechaCierre(event.target.value);
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

        const today = new Date();
        const fechaAperturaDate = new Date(fechaApertura);
        const fechaCierreDate = new Date(fechaCierre);

        if (fechaAperturaDate < today) {

            setError("La fecha de apertura debe ser mayor a la fecha actual.");
            return;
        }
        if (fechaCierreDate < fechaAperturaDate) {
            setError("La fecha de cierre debe ser mayor a la fecha de apertura.")
            return;
        }
        const espacioData = {
            nombre,
            descripcion,
            fecha_apertura: fechaApertura,
            fecha_cierre: fechaCierre,
            id_rol: idRol,
            id_modalidad: idModalidad,
            id_etapa: idEtapa,
            id_rubrica: idRubrica,
        };
        onClose(espacioData);
        setNombre("");
        setDescripcion("");
        setFechaApertura("");
        setFechaCierre("");
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


    const handleClose = () => {
        onClose();
        setNombre("");
        setDescripcion("");
        setFechaApertura("");
        setFechaCierre("");
        setIdRol("");
        setIdModalidad("");
        setIdEtapa("");
        setIdRubrica("");
        setError("")
    };
    return (
      
        <Dialog fullScreen TransitionComponent={Transition} open={open} {...other}>
             <form onSubmit={guardarEspacio}>
            <AppBar sx={{ position: 'relative' }}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close" >
                        <CloseIcon />
                    </IconButton>
                    <Typography sx={{ ml: 2, flex: 1 }} variant="h2" component="div">
                        Espacio de entrega
                    </Typography>
                    <Button  type="submit" color="inherit" variant="h2" startIcon={<SaveOutlined />} >
                        Guardar
                    </Button>
                </Toolbar>
            </AppBar>
           
            <Box display="flex" flexDirection="column" gap={1} sx={{ m: 5 }}>
              
                    <Typography variant="h2" color={colors.primary[100]} sx={{ mb: "30px" }}>
                        Crear un nuevo espacio
                    </Typography>
                    <TextField
                        label="Nombre"
                        value={nombre}
                        onChange={handleNombreChange}
                        required
                    />
                    <TextField
                        label="Descripción"
                        value={descripcion}
                        onChange={handleDescripcionChange}
                        multiline
                        rows={4}
                    />
                    <TextField
                        label="Fecha de apertura"
                        type="date"
                        value={fechaApertura}
                        onChange={handleFechaAperturaChange}
                        required
                    />
                    <TextField
                        label="Fecha de cierre"
                        type="date"
                        value={fechaCierre}
                        onChange={handleFechaCierreChange}
                        required
                    />
                    <Select
                        label="Rol"
                        value={idRol}
                        onChange={handleIdRolChange}
                        required
                    >
                        {roles.map((rol) => (
                            <MenuItem key={rol.id} value={rol.id}>
                                {rol.nombre}
                            </MenuItem>
                        ))}
                    </Select>
                    <Select
                        label="Modalidad"
                        value={idModalidad}
                        onChange={handleIdModalidadChange}
                        required
                    >
                        {modalidades.map((modalidad) => (
                            <MenuItem key={modalidad.id} value={modalidad.id}>
                                {modalidad.nombre}
                            </MenuItem>
                        ))}
                    </Select>
                    <Select
                        label="Etapa"
                        value={idEtapa}
                        onChange={handleIdEtapaChange}
                        required
                    >
                        {etapas.map((etapa) => (
                            <MenuItem key={etapa.id} value={etapa.id}>
                                {etapa.nombre}
                            </MenuItem>
                        ))}
                    </Select>
                    <Select
                        label="Rúbrica"
                        value={idRubrica}
                        onChange={handleIdRubricaChange}
                        required
                    >
                        {rubricas.map((rubrica) => (
                            <MenuItem key={rubrica.id} value={rubrica.id}>
                                {rubrica.nombre}
                            </MenuItem>
                        ))}
                    </Select>
                    {error && (
                        <Alert severity="error" onClose={menError}>
                            {error}
                        </Alert>
                    )}
              
            </Box>
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