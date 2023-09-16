import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { selectToken } from '../../../../store/authSlice';
import {
    Typography,
    CircularProgress,
    Box,
    TextField,
    Button,
    DialogTitle,
    Dialog,
    DialogActions,
    DialogContent,
    TableContainer,
    Paper,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Select,
    MenuItem,
    FormControl,
    IconButton} from '@mui/material';
import { useSnackbar } from 'notistack';
import { Edit, SaveOutlined } from '@mui/icons-material';


function VerModificarRubrica(props) {
    const apiBaseUrl = process.env.REACT_APP_API_URL;
    const { enqueueSnackbar } = useSnackbar();
    const { onClose, onSubmit, rubrica = {}, open, ...other } = props;

    const token = useSelector(selectToken);


    const [loading, setLoading] = useState(true);
    const [rubricaNombre, setRubricaNombre] = useState('');
    const [rubricaDescripcion, setRubricaDescripcion] = useState('');
    const [selectedAspectos, setSelectedAspectos] = useState([]);
    const [aspectoPuntajes, setAspectoPuntajes] = useState([]);
    const [puntajesWarning, setPuntajesWarning] = useState(false);
    const [aspectos, setAspectos] = useState([]);

    const mostrarMensaje = (mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    };

    const handleEntering = async () => {
        setRubricaNombre(rubrica.rubrica_nombre)
        setRubricaDescripcion(rubrica.rubrica_descripcion)
        if (rubrica.aspectos) {
            const aspectoPuntajes = rubrica.aspectos.reduce((acc, aspecto) => {
                return { ...acc, [aspecto.id]: aspecto.aspecto_puntaje };
            }, {});
            const nuevoArreglo = rubrica.aspectos.map(({ id, aspecto_nombre }) => ({
                id,
                nombre: aspecto_nombre
            }));
            setAspectoPuntajes(aspectoPuntajes);
            setSelectedAspectos(nuevoArreglo)
        }
        obtenerAspectos()
        setLoading(false);
    };
    const handleCancel = () => {
        onClose();
        setRubricaNombre("")
        setRubricaDescripcion("")
        setSelectedAspectos([])
        setAspectoPuntajes([])
        setAspectos([])
        setLoading(true);
        setEditMode(false)
    };

    const obtenerAspectos = async () => {
        try {
            const response = await fetch(`${apiBaseUrl}/comite/aspecto`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error");
            } else if (response.status === 203) {
                mostrarMensaje(data.message, "warning");
            } else if (response.status === 200) {
                setAspectos(data.aspectos);
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error al obtener los aspectos. Por favor, intente de nuevo más tarde.", "error");
        }
    };
    const modificarRubrica = async (event) => {
        event.preventDefault();
        const puntajesSum = selectedAspectos.reduce((sum, aspecto) => sum + (aspectoPuntajes[aspecto.id] || 0), 0);
        if (puntajesSum === 100) {
            try {
                const rubricaData = {
                    nombre: rubricaNombre,
                    descripcion: rubricaDescripcion,
                    aspectos: selectedAspectos.map((aspecto) => ({
                        ...aspecto,
                        puntaje: aspectoPuntajes[aspecto.id] || 0,
                    })),
                };

                const response = await fetch(`${apiBaseUrl}/comite/rubrica/${rubrica.id}`, {
                    method: 'PUT',
                    headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(rubricaData),
                });
                const data = await response.json();
                if (data.success) {
                    setRubricaNombre("")
                    setRubricaDescripcion("")
                    setSelectedAspectos([])
                    setAspectoPuntajes({})
                    setAspectos([])
                    setLoading(true);
                    setEditMode(false)
                    onSubmit()
                    mostrarMensaje(data.message, "success");
                } else {
                    mostrarMensaje(data.message, "error");
                }
            } catch (error) {
                mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
            }
        } else {
            mostrarMensaje("La suma de los aspectos debe ser 100", "error");
        }
    };

    const handleAspectoSelect = (event) => {
        const aspectoId = event.target.value;
        const selectedAspecto = aspectos.find((aspecto) => aspecto.id === aspectoId);
        const isAspectoSelected = selectedAspectos.some((aspecto) => aspecto.id === aspectoId);
        if (!isAspectoSelected) {
            setSelectedAspectos([...selectedAspectos, selectedAspecto]);
        }
    };

    const handleAspectoRemove = (aspectoId) => {
        const updatedSelectedAspectos = selectedAspectos.filter((aspecto) => aspecto.id !== aspectoId);
        setSelectedAspectos(updatedSelectedAspectos);
        const updatedAspectoPuntajes = { ...aspectoPuntajes };
        delete updatedAspectoPuntajes[aspectoId];
        setAspectoPuntajes(updatedAspectoPuntajes);
    };

    const handleAspectoPuntajeChange = (aspectoId, newPuntaje) => {
        const parsedPuntaje = parseInt(newPuntaje);

        setAspectoPuntajes({ ...aspectoPuntajes, [aspectoId]: parsedPuntaje });

        const puntajesSum = selectedAspectos.reduce((sum, aspecto) => sum + (aspectoPuntajes[aspecto.id] || 0), 0);

        if (puntajesSum === 100) {
            setPuntajesWarning(false);
        } else {
            setPuntajesWarning(true);
        }
    };

    const handleNombreRubChange = (value) => {
        const isOnlyWhitespace = /^\s*$/.test(value);
        setRubricaNombre(isOnlyWhitespace ? "" : value);
    };

    const handleDescripcionRubChange = (value) => {
        const isOnlyWhitespace = /^\s*$/.test(value);
        setRubricaDescripcion(isOnlyWhitespace ? "" : value);
    };

    const [editMode, setEditMode] = useState(false);

    const habilitarEdicion = async () => {
        try {
            const response = await fetch(`${apiBaseUrl}/comite/usoRubrica/${rubrica.id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setEditMode(!editMode);
            } else {
                mostrarMensaje(data.message, "warning");
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error al obtener los aspectos. Por favor, intente de nuevo más tarde.", "error");
        }

    };
    return (

        <Dialog fullWidth maxWidth="md"  open={open} {...other} onClose={handleCancel} TransitionProps={{ onEntering: handleEntering }}>

            <DialogTitle variant="h1" color="primary">
                VER/MODIFICAR RUBRICA
                <IconButton onClick={habilitarEdicion}>
                    <Edit />
                </IconButton>
            </DialogTitle>
            <form onSubmit={modificarRubrica}>
                <DialogContent dividers>
                <Typography variant="h6">
                Al modificar una rúbrica, cambiará en todos los espacios de entrega donde se esté usando.
                    </Typography>
                    {loading ? (
                        <Box sx={{ display: 'flex' }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <Typography variant="h6" color="primary">
                                Nombre de la rubrica
                            </Typography>
                            <TextField
                                value={rubricaNombre}
                                onChange={(e) => handleNombreRubChange(e.target.value)}
                                error={!rubricaNombre}
                                helperText={'Ingresa el nombre de la rubrica.'}
                                required
                                fullWidth
                                disabled={!editMode}
                            />
                            <Typography variant="h6" color="primary">
                                Descripción
                            </Typography>
                            <TextField
                                multiline
                                rows={2}
                                value={rubricaDescripcion}
                                onChange={(e) => handleDescripcionRubChange(e.target.value)}
                                error={!rubricaDescripcion}
                                helperText={'Ingresa la descripción de la rubrica.'}
                                required
                                fullWidth
                                disabled={!editMode}
                            />

                            <FormControl fullWidth margin="normal">
                                <Typography variant="h6" color="primary">
                                    Seleccionar aspectos
                                </Typography>
                                <Select
                                    value=""
                                    disabled={!editMode}
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
                            <Typography variant="h4" color="secondary">
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
                                                        value={aspectoPuntajes[aspecto.id] || 0}
                                                        onChange={(e) => handleAspectoPuntajeChange(aspecto.id, e.target.value)}
                                                        inputProps={{
                                                            min: 1,
                                                            max: 100,
                                                        }}
                                                        required
                                                        error={!aspectoPuntajes[aspecto.id] ||
                                                            aspectoPuntajes[aspecto.id] > 100 ||
                                                            aspectoPuntajes[aspecto.id] < 1
                                                        }
                                                        helperText={"El puntaje debe estar entre 1 y 100"}
                                                        disabled={!editMode}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="outlined"
                                                        color="secondary"
                                                        onClick={() => handleAspectoRemove(aspecto.id)}
                                                        disabled={!editMode}
                                                    >
                                                        Eliminar
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            {puntajesWarning ? (<div>La suma de los puntajes debe ser igual a 100</div>
                            ) : (
                                <div />
                            )}
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancel}>Cerrar</Button>
                    <Button type="submit" variant="contained" startIcon={<SaveOutlined />} disabled={!editMode} sx={{
                        width: 150,
                    }}>
                        Guardar
                    </Button>
                </DialogActions>
            </form>
        </Dialog>

    );
}
VerModificarRubrica.propTypes = {
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    rubrica: PropTypes.object.isRequired,
};

export default VerModificarRubrica;