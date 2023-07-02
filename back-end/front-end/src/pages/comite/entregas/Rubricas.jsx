import React, { useState, useEffect } from "react";

import { tokens } from "../../../theme";
import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";
import Row from "./Rubricas/ItemRubrica";

import { Typography, Alert, useTheme, Divider, Snackbar, TableContainer, Paper, Table, TableHead, TableBody, TableRow, TableCell, Select, MenuItem, FormControl, InputLabel, Box, Button, TextField } from '@mui/material';

export default function Rubricas() {

    const token = useSelector(selectToken);

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [error, setError] = useState(null);
    const [mensaje, setMensaje] = useState(null);

    const [items, setItems] = useState([]);
    const [rubricaNombre, setRubricaNombre] = useState('');
    const [rubricaDescripcion, setRubricaDescripcion] = useState('');
    const [selectedItems, setSelectedItems] = useState([]);
    const [itemPuntajes, setItemPuntajes] = useState({});
    const [puntajesWarning, setPuntajesWarning] = useState(false);
    const [rubricas, setRubricas] = useState([]);

    const [nombre, setNombre] = useState("");


    const menError = () => setError(null);
    const menSuccess = () => setMensaje(null);

    const obtenerItems = async () => {
        try {
            const response = await fetch("http://localhost:5000/comite/item", {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!data.success) {
                setError(data.message);
            } else if (response.status === 203) {
                setMensaje(data.message)
            } else if (response.status === 200) {
                setItems(data.items);
            }



        } catch (error) {
            setError("Lo siento, ha ocurrido un error al obtener los items. Por favor, intente de nuevo más tarde.");
        }
    };
    const handleItemSelect = (event) => {
        const itemId = event.target.value;
        const selectedItem = items.find((item) => item.id === itemId);

        // Verificar si el item ya está seleccionado
        const isItemSelected = selectedItems.some((item) => item.id === itemId);
        if (!isItemSelected) {
            setSelectedItems([...selectedItems, selectedItem]);
        }
    };

    const handleItemRemove = (itemId) => {
        const updatedSelectedItems = selectedItems.filter((item) => item.id !== itemId);
        setSelectedItems(updatedSelectedItems);
        // Remove puntaje associated with removed item
        const updatedItemPuntajes = { ...itemPuntajes };
        delete updatedItemPuntajes[itemId];
        setItemPuntajes(updatedItemPuntajes);
    };

    const handleItemPuntajeChange = (itemId, newPuntaje) => {
        const parsedPuntaje = parseInt(newPuntaje);

        setItemPuntajes({ ...itemPuntajes, [itemId]: parsedPuntaje });

        const puntajesSum = selectedItems.reduce((sum, item) => sum + (itemPuntajes[item.id] || 0), 0);

        if (puntajesSum == 100) {
            setPuntajesWarning(false);
        } else {
            setPuntajesWarning(true);
        }
    };
    const handleSubmit = async () => {

        const puntajesSum = selectedItems.reduce((sum, item) => sum + (itemPuntajes[item.id] || 0), 0);
        if (puntajesSum == 100) {
            try {
                const rubricaData = {
                    nombre: rubricaNombre,
                    descripcion: rubricaDescripcion,
                    items: selectedItems.map((item) => ({
                        ...item,
                        puntaje: itemPuntajes[item.id] || 0,
                    })),
                };

                const response = await fetch('http://localhost:5000/comite/rubrica', {
                    method: 'POST',
                    headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(rubricaData),
                });
                const data = await response.json();
                if (data.success) {
                    setRubricaNombre('');
                    setRubricaDescripcion('');
                    setSelectedItems([]);
                    setItemPuntajes({});
                    obtenerRubricas();
                    setMensaje(data.mensaje)
                } else {

                    setError(data.message);
                }
            } catch (error) {
                setError("Lo siento, ha ocurrido un error al modificar el item. Por favor, intente de nuevo más tarde.");
            }
        } else {
            setError("La suma de los items debe ser 100")
        }
    };



    const obtenerRubricas = async () => {
        try {
            const response = await fetch('http://localhost:5000/comite/obtenerRubricasConItems', {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {

                setRubricas(data.rubricas);
            }
        } catch (error) {
            console.log('Error al obtener las rubricas:', error);
        }
    };
    const crearItem = async () => {
        try {
            const response = await fetch("http://localhost:5000/comite/item", {
                method: "POST",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ nombre })
            });
            const data = await response.json();
            if (!data.success) {
                setError(data.message);
            } else {
                setNombre("");
                obtenerItems();
            }
        } catch (error) {
            setError("Lo siento, ha ocurrido un error al crear el item. Por favor, intente de nuevo más tarde.");
        }
    };

    const eliminarItem = async (itemId) => {
        try {
            const response = await fetch(`http://localhost:5000/comite/item/${itemId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!data.success) {
                setError(data.message);
            } else {
                setMensaje(data.message);
                obtenerItems();
            }
        } catch (error) {
            setError("Lo siento, ha ocurrido un error al eliminar el item. Por favor, intente de nuevo más tarde.");
        }
    };

    const modificarItem = async (itemId) => {
        try {
            const response = await fetch(`http://localhost:5000/comite/item/${itemId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ nombre })
            });
            const data = await response.json();
            if (!data.success) {
                setError(data.message);
            } else {
                setNombre("");
                obtenerItems();
            }
        } catch (error) {
            setError("Lo siento, ha ocurrido un error al modificar el item. Por favor, intente de nuevo más tarde.");
        }
    };

    const obtenerItemPorId = async (itemId) => {
        try {
            const response = await fetch(`http://localhost:5000/comite/item/${itemId}`, {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!data.success) {
                setError(data.message);
            } else {
                // Hacer algo con el item obtenido
            }
        } catch (error) {
            setError("Lo siento, ha ocurrido un error al obtener el item. Por favor, intente de nuevo más tarde.");
        }
    };
    useEffect(() => {
        obtenerRubricas();
        obtenerItems();
    }, []);

    return (
        <div style={{ margin: "15px" }} >
            {error && (
                <Snackbar open={true} autoHideDuration={4000} onClose={menError} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                    <Alert severity="error" onClose={menError}>
                        {error}
                    </Alert>
                </Snackbar>
            )}
            {mensaje && (
                <Snackbar open={true} autoHideDuration={3000} onClose={menSuccess} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                    <Alert onClose={menSuccess} severity="success">
                        {mensaje}
                    </Alert>
                </Snackbar>
            )}
            <Typography
                variant="h1"
                color={colors.secundary[100]}
                fontWeight="bold"
            >
                ITEMS Y RUBRICAS DE CALIFICACIÓN
            </Typography>
            <Divider sx={{ mt: "15px", mb: "15px" }} />
            <Typography variant="h2" color={colors.primary[100]}>
                ITEMS
            </Typography>
            <Divider sx={{ mt: "15px", mb: "15px" }} />
            <Typography
                variant="h3"
                color={colors.naranja[100]}
            >
                Crear Item
            </Typography>
            <TextField
                label="Nombre del item"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                fullWidth
                margin="normal"
            />
            <Button variant="contained" color="primary" onClick={crearItem}>
                Crear Item
            </Button>

            {items.length > 0 && (
                <Box>
                    <Typography
                        variant="h3"
                        color={colors.naranja[100]}
                    >
                        Listado de items
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
                            {items.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell>{row.id}</TableCell>
                                    <TableCell>{row.nombre}</TableCell>
                                    <TableCell>
                                        <Button variant="contained" color="primary" onClick={() => obtenerItemPorId(row.id)}>
                                            Ver
                                        </Button>
                                        <Button variant="contained" color="secondary" onClick={() => eliminarItem(row.id)}>
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
                    <InputLabel>Seleccionar items</InputLabel>
                    <Select
                        value=""
                        onChange={handleItemSelect}
                        renderValue={() => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {selectedItems.map((item) => (
                                    <Button
                                        key={item.id}
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => handleItemRemove(item.id)}
                                    >
                                        {item.nombre}
                                    </Button>
                                ))}
                            </Box>
                        )}
                    >
                        {items.map((item) => (
                            <MenuItem key={item.id} value={item.id}>
                                {item.nombre}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Typography
                    variant="h4"
                    color={colors.secundary[100]}
                >
                    Items seleccionados
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
                            {selectedItems.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.nombre}</TableCell>
                                    <TableCell>
                                        <TextField
                                            type="number"
                                            value={itemPuntajes[item.id] || ''}
                                            onChange={(e) => handleItemPuntajeChange(item.id, e.target.value)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outlined"
                                            color="secondary"
                                            onClick={() => handleItemRemove(item.id)}
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
                            <Row key={row.rubrica_id} row={row} />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}