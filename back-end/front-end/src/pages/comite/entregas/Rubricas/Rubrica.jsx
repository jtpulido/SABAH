import React, { useState, useEffect } from "react";

import { Alert, Snackbar } from "@mui/material";
import { useSelector } from "react-redux";
import { selectToken } from "../../../../store/authSlice";
import Row from "./ItemRubrica";
import { Button, TableContainer, TextField, Paper, Table, TableHead, TableBody, TableRow, TableCell, Select, MenuItem, FormControl, InputLabel, Box } from '@mui/material';

export default function Rubrica() {

    const token = useSelector(selectToken);


    const [error, setError] = useState(null);
    const [mensaje, setMensaje] = useState(null);

    const [items, setItems] = useState([]);
    const [rubricaNombre, setRubricaNombre] = useState('');
    const [rubricaDescripcion, setRubricaDescripcion] = useState('');
    const [selectedItems, setSelectedItems] = useState([]);
    const [itemPuntajes, setItemPuntajes] = useState({});
    const [puntajesWarning, setPuntajesWarning] = useState(false);
    const [rubricas, setRubricas] = useState([]);

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
            console.log(error)
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

            <h1>Crear Rubrica</h1>
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
                <h3>Items Seleccionados:</h3>
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

            <h1>Rubricas</h1>

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