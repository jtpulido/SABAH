import React, { useState, useEffect } from 'react';

import { tokens } from "../../../../theme";
import PropTypes from 'prop-types';
import { useTheme, TextField, Button, Box, Select, MenuItem, Alert, Dialog, AppBar, Toolbar, Typography, Slide, IconButton } from "@mui/material";

import CloseIcon from '@mui/icons-material/Close';
import { SaveOutlined } from '@mui/icons-material';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function VerRubrica(props) {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const { onClose, rubrica: rubricavalueProp = [], open, ...other } = props;

    const handleClose = () => {
        onClose();
    };
    return (

        <Dialog fullScreen TransitionComponent={Transition} open={open} {...other}>
        
                <AppBar sx={{ position: 'relative' }}>
                    <Toolbar>
                        <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close" >
                            <CloseIcon />
                        </IconButton>
                        <Typography sx={{ ml: 2, flex: 1 }} variant="h2" component="div">
                            Espacio de entrega
                        </Typography>
                        <Button type="submit" color="inherit" variant="h2" startIcon={<SaveOutlined />} >
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
                        fullWidth
                    />
                    <TextField
                        label="Descripción"
                        value={descripcion}
                        onChange={handleDescripcionChange}
                        multiline
                        rows={4}
                        fullWidth
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
        </Dialog>

    );
}
VerRubrica.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    roles: PropTypes.array.isRequired,
    modalidades: PropTypes.array.isRequired,
    etapas: PropTypes.array.isRequired,
    rubricas: PropTypes.array.isRequired,
};

export default VerRubrica;