import React, { useState, useEffect } from "react";

import { tokens } from "../../../theme";
import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";
import Row from "./Ventanas/AspectoRubrica";

import { useSnackbar } from 'notistack';
import { Typography, useTheme, Divider, TableContainer, Paper, Table, TableHead, TableBody, TableRow, TableCell, Select, MenuItem, FormControl, InputLabel, Box, Button, TextField } from '@mui/material';

export default function Rubricas() {


    const { enqueueSnackbar } = useSnackbar();

    const mostrarMensaje = (mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    };
    const token = useSelector(selectToken);

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);


    const [aspectos, setAspectos] = useState([]);
    const [rubricaNombre, setRubricaNombre] = useState('');
    const [rubricaDescripcion, setRubricaDescripcion] = useState('');
    const [selectedAspectos, setSelectedAspectos] = useState([]);
    const [aspectoPuntajes, setAspectoPuntajes] = useState({});
    const [puntajesWarning, setPuntajesWarning] = useState(false);
    const [rubricas, setRubricas] = useState([]);

    const [nombre, setNombre] = useState("");

    const obtenerAspectos = async () => {
        try {
            const response = await fetch("http://localhost:5000/comite/aspecto", {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error")
            } else if (response.status === 203) {
                mostrarMensaje(data.message, "warning")
            } else if (response.status === 200) {
                setAspectos(data.aspectos);
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error al obtener los aspectos. Por favor, intente de nuevo más tarde.","error");
        }
    };
    
    const handleAspectoSelect = (event) => {
        const aspectoId = event.target.value;
        const selectedAspecto = aspectos.find((aspecto) => aspecto.id === aspectoId);

        // Verificar si el aspecto ya está seleccionado
        const isAspectoSelected = selectedAspectos.some((aspecto) => aspecto.id === aspectoId);
        if (!isAspectoSelected) {
            setSelectedAspectos([...selectedAspectos, selectedAspecto]);
        }
    };

    const handleAspectoRemove = (aspectoId) => {
        const updatedSelectedAspectos = selectedAspectos.filter((aspecto) => aspecto.id !== aspectoId);
        setSelectedAspectos(updatedSelectedAspectos);
        // Remove puntaje associated with removed aspecto
        const updatedAspectoPuntajes = { ...aspectoPuntajes };
        delete updatedAspectoPuntajes[aspectoId];
        setAspectoPuntajes(updatedAspectoPuntajes);
    };

    const handleAspectoPuntajeChange = (aspectoId, newPuntaje) => {
        const parsedPuntaje = parseInt(newPuntaje);

        setAspectoPuntajes({ ...aspectoPuntajes, [aspectoId]: parsedPuntaje });

        const puntajesSum = selectedAspectos.reduce((sum, aspecto) => sum + (aspectoPuntajes[aspecto.id] || 0), 0);

        if (puntajesSum == 100) {
            setPuntajesWarning(false);
        } else {
            setPuntajesWarning(true);
        }
    };
    const handleSubmit = async () => {

        const puntajesSum = selectedAspectos.reduce((sum, aspecto) => sum + (aspectoPuntajes[aspecto.id] || 0), 0);
        if (puntajesSum == 100) {
            try {
                const rubricaData = {
                    nombre: rubricaNombre,
                    descripcion: rubricaDescripcion,
                    aspectos: selectedAspectos.map((aspecto) => ({
                        ...aspecto,
                        puntaje: aspectoPuntajes[aspecto.id] || 0,
                    })),
                };

                const response = await fetch('http://localhost:5000/comite/crearRubrica', {
                    method: 'POST',
                    headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(rubricaData),
                });
                const data = await response.json();
                if (data.success) {
                    setRubricaNombre('');
                    setRubricaDescripcion('');
                    setSelectedAspectos([]);
                    setAspectoPuntajes({});
                    obtenerRubricas();
                    mostrarMensaje(data.mensaje,"success")
                } else {
                    mostrarMensaje(data.message, "error")
                }
            } catch (error) {
                mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
            }
        } else {
            mostrarMensaje("La suma de los aspectos debe ser 100", "error")
        }
    };



    const obtenerRubricas = async () => {
        try {
            const response = await fetch('http://localhost:5000/comite/obtenerRubricasConAspectos', {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {

                setRubricas(data.rubricas);
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
        }
    };
    const crearAspecto = async () => {
        try {
            const response = await fetch("http://localhost:5000/comite/aspecto", {
                method: "POST",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ nombre })
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error")
            } else {
                setNombre("");
                obtenerAspectos();
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
        }
    };

    const eliminarAspecto = async (aspectoId) => {
        try {
            const response = await fetch(`http://localhost:5000/comite/aspecto/${aspectoId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error")
            } else {
                mostrarMensaje(data.message, "success")
                obtenerAspectos();
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
        }
    };

    const modificarAspecto = async (aspectoId) => {
        try {
            const response = await fetch(`http://localhost:5000/comite/aspecto/${aspectoId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ nombre })
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error")
            } else {
                setNombre("");
                obtenerAspectos();
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
        }
    };

    const obtenerAspectoPorId = async (aspectoId) => {
        try {
            const response = await fetch(`http://localhost:5000/comite/aspecto/${aspectoId}`, {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error")
            } else {
                // Hacer algo con el aspecto obtenido
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
        }
    };
    useEffect(() => {
        obtenerRubricas();
        obtenerAspectos();
    }, []);

    return (
        <div style={{ margin: "15px" }} >

            <Typography
                variant="h1"
                color={colors.secundary[100]}
                fontWeight="bold"
            >
                ASPECTOS Y RUBRICAS DE CALIFICACIÓN
            </Typography>
            <Divider sx={{ mt: "15px", mb: "15px" }} />
            <Typography variant="h2" color={colors.primary[100]}>
                ASPECTOS
            </Typography>
            <Divider sx={{ mt: "15px", mb: "15px" }} />
            <Typography
                variant="h3"
                color={colors.naranja[100]}
            >
                Crear Aspecto
            </Typography>
            <TextField
                label="Nombre del aspecto"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                fullWidth
                margin="normal"
            />
            <Button variant="contained" color="primary" onClick={crearAspecto}>
                Crear Aspecto
            </Button>

            {aspectos.length > 0 && (
                <Box>
                    <Typography
                        variant="h3"
                        color={colors.naranja[100]}
                    >
                        Listado de aspectos
                    </Typography>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Nombre</TableCell>
                                <TableCell>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {aspectos.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell>{row.id}</TableCell>
                                    <TableCell>{row.nombre}</TableCell>
                                    <TableCell>
                                        <Button variant="contained" color="primary" onClick={() => obtenerAspectoPorId(row.id)}>
                                            Editar
                                        </Button>
                                        <Button variant="contained" color="secondary" onClick={() => eliminarAspecto(row.id)}>
                                            Eliminar
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Box>

            )}
            <Divider sx={{ mt: "15px", mb: "15px" }} />
            <Typography variant="h2" color={colors.primary[100]}>
                RUBRICAS
            </Typography>
            <Divider sx={{ mt: "15px", mb: "15px" }} />
            <Typography
                variant="h3"
                color={colors.naranja[100]}
            >
                Crear nueva rubrica
            </Typography>
            <FormControl fullWidth margin="normal">
                <TextField
                    label="Nombre"
                    value={rubricaNombre}
                    onChange={(e) => setRubricaNombre(e.target.value)}
                />

                <TextField
                    label="Descripción"
                    multiline
                    rows={4}
                    value={rubricaDescripcion}
                    onChange={(e) => setRubricaDescripcion(e.target.value)}
                />

                <FormControl fullWidth margin="normal">
                    <InputLabel>Seleccionar aspectos</InputLabel>
                    <Select
                        value=""
                        onChange={handleAspectoSelect}
                        renderValue={() => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {selectedAspectos.map((aspecto) => (
                                    <Button
                                        key={aspecto.id}
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => handleAspectoRemove(aspecto.id)}
                                    >
                                        {aspecto.nombre}
                                    </Button>
                                ))}
                            </Box>
                        )}
                    >
                        {aspectos.map((aspecto) => (
                            <MenuItem key={aspecto.id} value={aspecto.id}>
                                {aspecto.nombre}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Typography
                    variant="h4"
                    color={colors.secundary[100]}
                >
                    Aspectos seleccionados
                </Typography>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Nombre</TableCell>
                                <TableCell>Puntaje</TableCell>
                                <TableCell>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {selectedAspectos.map((aspecto) => (
                                <TableRow key={aspecto.id}>
                                    <TableCell>{aspecto.nombre}</TableCell>
                                    <TableCell>
                                        <TextField
                                            type="number"
                                            value={aspectoPuntajes[aspecto.id] || ''}
                                            onChange={(e) => handleAspectoPuntajeChange(aspecto.id, e.target.value)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outlined"
                                            color="secondary"
                                            onClick={() => handleAspectoRemove(aspecto.id)}
                                        >
                                            Eliminar
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                {puntajesWarning && <div>La suma de los puntajes debe ser igual a 100</div>}
                <Button type="submit" variant="contained" color="primary" onClick={() => handleSubmit()}>
                    Crear Rubrica
                </Button>

            </FormControl>

            <Typography
                variant="h3"
                color={colors.naranja[100]}
            >
                Rubricas
            </Typography>

            <TableContainer component={Paper}>
                <Table aria-label="Rubricas">
                    <TableHead>
                        <TableRow>
                            <TableCell />
                            <TableCell align="center">ID</TableCell>
                            <TableCell align="center">NOMBRE</TableCell>
                            <TableCell align="center">DESCRIPCIÓN</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rubricas.map((row) => (
                            <Row key={row.id_rubrica} row={row} />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}