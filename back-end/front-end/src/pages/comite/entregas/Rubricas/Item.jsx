import React, { useState, useEffect } from "react";

import { Alert, Box, Snackbar } from "@mui/material";
import { useSelector } from "react-redux";
import { selectToken } from "../../../../store/authSlice";

import { tokens } from "../../../../theme";
import { Button, TextField, Table, TableHead, TableBody, TableRow, TableCell,Typography ,useTheme} from '@mui/material';



export default function Item() {

    const token = useSelector(selectToken);

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [nombre, setNombre] = useState("");

    const [error, setError] = useState(null);
    const [mensaje, setMensaje] = useState(null);

    const [items, setItems] = useState([]);

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
                setMensaje("Se elimino el item");
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


        </div>
    );
}