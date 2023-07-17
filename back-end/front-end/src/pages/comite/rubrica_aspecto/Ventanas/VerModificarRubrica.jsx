import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { tokens } from '../../../../theme';
import { useSelector } from 'react-redux';
import { selectToken } from '../../../../store/authSlice';
import {
    Typography,
    useTheme,
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
    Slide,
    IconButton,
    Tooltip
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { Delete, Edit, SaveOutlined } from '@mui/icons-material';
import CustomDataGrid from '../../../layouts/DataGrid';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function VerModificarRubrica(props) {

    const { enqueueSnackbar } = useSnackbar();
    const { onClose, rubrica = {}, open, ...other } = props;

    const token = useSelector(selectToken);

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [loading, setLoading] = useState(true);
    const [id, setId] = useState(rubrica.id);

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
        console.log(rubrica);
        setRubricaNombre(rubrica.rubrica_nombre)
        setRubricaDescripcion(rubrica.rubrica_descripcion)
        setSelectedAspectos(rubrica.aspectos)
        if (rubrica.aspectos) {
            const aspectoPuntajes = rubrica.aspectos.reduce((acc, aspecto) => {
                return { ...acc, [aspecto.id]: aspecto.aspecto_puntaje };
            }, {});
            setAspectoPuntajes(aspectoPuntajes);
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
    };

    const obtenerAspectos = async () => {
        try {
            const response = await fetch("http://localhost:5000/comite/aspecto", {
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
        setRubricaNombre("")
        setRubricaDescripcion("")
        setSelectedAspectos([])
        setAspectoPuntajes({})
        setAspectos([])
        setLoading(true);
        console.log(rubrica)
    }
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

    const habilitarEdicion = async() => {
        try {
            const response = await fetch("http://localhost:5000/usoRubrica/aspecto", {
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

        <Dialog fullWidth maxWidth="md" TransitionComponent={Transition} open={open} {...other} TransitionProps={{ onEntering: handleEntering }}>

            <DialogTitle variant="h1" color={colors.primary[100]}>
                VER/MODIFICAR RUBRICA
                <IconButton onClick={habilitarEdicion}>
                    <Edit />
                </IconButton>
            </DialogTitle>
            <form onSubmit={modificarRubrica}>
                <DialogContent dividers>
                    {loading ? (
                        <Box sx={{ display: 'flex' }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <Typography variant="h6" color={colors.primary[100]}>
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
                            <Typography variant="h6" color={colors.primary[100]}>
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

                            <FormControl fullWidth margin="normal" required>
                                <Typography variant="h6" color={colors.primary[100]}>
                                    Seleccionar aspectos
                                </Typography>
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
                                    disabled={!editMode}
                                >
                                    {aspectos.map((aspecto) => (
                                        <MenuItem key={aspecto.id} value={aspecto.id}>
                                            {aspecto.nombre}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Typography variant="h4" color={colors.secundary[100]}>
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
                                                <TableCell>{aspecto.aspecto_nombre}</TableCell>
                                                <TableCell>
                                                    <TextField
                                                        type="number"
                                                        value={aspectoPuntajes[aspecto.id] || 0}
                                                        onChange={(e) => handleAspectoPuntajeChange(aspecto.id, e.target.value)}
                                                        inputProps={{
                                                            min: 0,
                                                            max: 100,
                                                        }}
                                                        required
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
                    <Button type="submit" variant="contained" startIcon={<SaveOutlined />} >
                        Guardar
                    </Button>
                </DialogActions>
            </form>
        </Dialog>

    );
}
VerModificarRubrica.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    rubrica: PropTypes.object.isRequired,
};

export default VerModificarRubrica;