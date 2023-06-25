import React, { useState, useEffect } from "react";

import { Alert, Snackbar } from "@mui/material";
import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";

import { Button, TextField, Table, TableHead, TableBody, TableRow, TableCell, Select, MenuItem, FormControl, InputLabel, Box } from '@mui/material';


export default function Rubricas() {

    const token = useSelector(selectToken);

    const [nombre, setNombre] = useState("");

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
        obtenerItems();
        obtenerRubricas();
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
                <ul>
                    {selectedItems.map((item) => (
                        <li key={item.id}>
                            {item.nombre} - Puntaje:
                            <TextField
                                type="number"
                                value={itemPuntajes[item.id] || ''}
                                onChange={(e) => handleItemPuntajeChange(item.id, e.target.value)}
                            />
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={() => handleItemRemove(item.id)}
                            >
                                Eliminar
                            </Button>
                        </li>
                    ))}
                </ul>
                {puntajesWarning && <div>La suma de los puntajes debe ser igual a 100</div>}
                <Button type="submit" variant="contained" color="primary" onClick={() => handleSubmit()}>
                    Crear Rubrica
                </Button>
            </FormControl>
            <h1>Rubricas</h1>
            {rubricas.map((rubrica) => (
                <div key={rubrica.rubrica_id}>
                    <h3>{rubrica.rubrica_nombre}</h3>
                    <p>{rubrica.rubrica_descripcion}</p>
                    <ul>
                        {rubrica.items.map((item) => (
                            <li key={item.item_id}>
                                {item.item_nombre} - Puntaje: {item.item_puntaje}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}