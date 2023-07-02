import React, { useState } from "react";
import { TextField, Button, Box, Select, MenuItem, Alert, Snackbar } from "@mui/material";


export default function CrearEspacio({ onCrearEspacio, roles, modalidades, etapas, rubricas }) {

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

        if (fechaAperturaDate <= today) {
            setError("La fecha de apertura debe ser mayor a la fecha actual.");
            return;
        }
        if (fechaCierreDate <= fechaAperturaDate) {
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
        onCrearEspacio(espacioData);
        setNombre("");
        setDescripcion("");
        setFechaApertura("");
        setFechaCierre("");
        setIdRol("");
        setIdModalidad("");
        setIdEtapa("");
        setIdRubrica("");
    };

    return (
        <form onSubmit={guardarEspacio}>

            <Box display="flex" flexDirection="column" gap={2}>

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
                {roles.length > 0 ? (
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
                ) : (
                    <p>Cargando roles...</p>
                )}
                {modalidades.length > 0 ? (
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
                ) : (
                    <p>Cargando modalidades...</p>
                )}
                {etapas.length > 0 ? (
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
                ) : (
                    <p>Cargando etapas...</p>
                )}
                {rubricas.length > 0 ? (
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
                ) : (
                    <p>Cargando rúbricas...</p>
                )}
                {error && (
                    <Alert severity="error" onClose={menError}>
                        {error}
                    </Alert>
                )}
                <Button type="submit" variant="contained" color="primary">
                    Crear Espacio
                </Button>
            </Box>
        </form>
    );
}
