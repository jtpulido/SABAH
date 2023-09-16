import React, { useState, useEffect } from 'react';
import {
    FormControl, Select, MenuItem, Button, TextField,
    Box, Typography, AppBar, Toolbar, Grid, IconButton, Tooltip
} from '@mui/material';
import { selectToken } from '../../../store/authSlice';
import { useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import CustomDataGrid from '../../layouts/DataGrid';
import { Add, Delete, Remove, Replay } from '@mui/icons-material';

export default function Reportes() {
    const apiBaseUrl = process.env.REACT_APP_API_URL;
    const token = useSelector(selectToken);
    const { enqueueSnackbar } = useSnackbar();

    const [vistasDisponibles, setVistasDisponibles] = useState([]);
    const [vistaSeleccionada, setVistaSeleccionada] = useState('');

    const [columnasDisponibles, setColumnasDisponibles] = useState([]);
    const [columnasSeleccionadas, setColumnasSeleccionadas] = useState([]);
    const [resultadoReporte, setResultadoReporte] = useState([]);

    const [filtros, setFiltros] = useState([]);

    const mostrarMensaje = (mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    };

    useEffect(() => {
        obtenerVistasDisponibles()
    }, []);
    useEffect(() => {
        if (vistaSeleccionada) {
            obtenerColumnasDisponibles(vistaSeleccionada);
        }
    }, [vistaSeleccionada]);

    const obtenerVistasDisponibles = async () => {
        try {
            const response = await fetch(`${apiBaseUrl}/comite/vistas-disponibles`, {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error")
            } else if (response.status === 203) {
                mostrarMensaje(data.message, "warning")
            } else if (response.status === 200) {
                setVistasDisponibles(data.vistas);
            }
        }
        catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
        }

    };

    const obtenerColumnasDisponibles = async (vista) => {
        try {
            const response = await fetch(`${apiBaseUrl}/comite/columnas-disponibles/${vistaSeleccionada}`, {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error")
            } else if (response.status === 203) {
                mostrarMensaje(data.message, "warning")
            } else if (response.status === 200) {
                setColumnasDisponibles(data.columnas);
            }
        }
        catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
        }

    };

    const handleVistaChange = (event) => {
        const nuevaVista = event.target.value;
        setVistaSeleccionada(nuevaVista);
        setColumnasSeleccionadas([]);
    };

    const handleGenerarReporte = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${apiBaseUrl}/comite/generarReporte`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    vista: vistaSeleccionada,
                    columnas: columnasSeleccionadas,
                    filtros: filtros
                }),
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error")
                setColumnasEnFormato([])
            } else if (response.status === 203) {
                mostrarMensaje(data.message, "warning")
                setColumnasEnFormato([])
            } else if (response.status === 200) {
                setResultadoReporte(data.info)
                const columnasEnFormato = convertirAColumnasEnFormato(columnasSeleccionadas);
                setColumnasEnFormato(columnasEnFormato);
            }
        }
        catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
        }

    };
    const handleAgregarFiltro = () => {
        if (filtros.length === 0) {
            setFiltros([{ columna: '', operador: '', valor: '' }]);
        } else {
            setFiltros([...filtros, { columna: '', operador: '', valor: '', operadorUnion: 'AND' }]);
        }
    };

    const handleFiltroChange = (index, campo, valor) => {
        const nuevosFiltros = filtros.map((filtro, i) =>
            i === index ? { ...filtro, [campo]: valor } : filtro
        );
        setFiltros(nuevosFiltros);
    };

    const handleOperadorUnionChange = (index, valor) => {
        const nuevosFiltros = filtros.map((filtro, i) =>
            i === index ? { ...filtro, operadorUnion: valor } : filtro
        );
        setFiltros(nuevosFiltros);
    };

    const handleQuitarFiltro = (index) => {
        const nuevosFiltros = filtros.filter((filtro, i) => i !== index);
        setFiltros(nuevosFiltros);
    };

    const [columnasEnFormato, setColumnasEnFormato] = useState([]);

    const convertirAColumnasEnFormato = (columnas) => {
        return columnas.map((col) => ({
            field: col,
            headerName: col.replace(/_/g, ' ').replace(/\w+/g, (w) => w[0].toUpperCase() + w.slice(1)),
            minWidth: 150
        }));
    };
    const handleDeselectAllColumns = () => {
        setColumnasSeleccionadas([]);
    };
    const handleColumnSelectionChange = (selectedColumns) => {
        if (selectedColumns.includes('Seleccionar todas')) {
            setColumnasSeleccionadas(columnasDisponibles.map(columna => columna.column_name));
        } else {
            setColumnasSeleccionadas(selectedColumns);
        }
    };

    return (
        <div >
            <AppBar position="static" color="transparent" variant="contained" >
                <Toolbar >
                    <Typography variant="h1" color="secondary" fontWeight="bold" sx={{ flexGrow: 1 }}>
                        REPORTES
                    </Typography>
                </Toolbar>
            </AppBar>
            <Box sx={{ m: 2 }}>
                <form onSubmit={handleGenerarReporte}>
                    <FormControl fullWidth variant="outlined" style={{ marginBottom: 16 }}>
                        <Typography variant="h5" color="primary">
                            Seleccione el tipo de reporte que desea crear
                        </Typography>
                        <Select required value={vistaSeleccionada} onChange={handleVistaChange}>
                            {vistasDisponibles.map((vista) => (
                                <MenuItem key={vista.viewname} value={vista.viewname}>
                                    {vista.comment}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {vistaSeleccionada && (
                        <FormControl fullWidth variant="outlined" style={{ marginBottom: 16 }}>
                            <Typography variant="h5" color="primary">
                                Seleccione las columnas
                            </Typography>
                            <div style={{ display: 'flex', alignItems: 'center', maxWidth: '100%' }}>
                                <Select
                                    required
                                    multiple
                                    multiline
                                    value={columnasSeleccionadas}
                                    onChange={(event) => handleColumnSelectionChange(event.target.value)}
                                    sx={{ flexGrow: 1, maxWidth: '98%' }}
                                >
                                    <MenuItem value="Seleccionar todas">Seleccionar todas</MenuItem>
                                    {columnasDisponibles.map((columna) => (
                                        <MenuItem key={columna.column_name} value={columna.column_name}>
                                            {columna.column_name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <Tooltip title="Quitar todas">
                                    <IconButton variant="outlined" color='naranja' size="large" onClick={handleDeselectAllColumns} sx={{ marginLeft: '8px' }}>
                                        <Remove fontSize="inherit" />
                                    </IconButton>
                                </Tooltip>
                            </div>
                        </FormControl>

                    )}
                    {vistaSeleccionada && (
                        <div>
                            {filtros.map((filtro, index) => (
                                <Grid container spacing={2} key={index}>
                                    {index !== 0 && (
                                        <Grid item xs={12} sm={6} md={2} lg={2}>
                                            <FormControl fullWidth variant="outlined" style={{ marginBottom: 16 }}>
                                                <Typography variant="h5" color="primary">
                                                    Operador
                                                </Typography>
                                                <Select
                                                    value={filtro.operadorUnion}
                                                    onChange={(event) =>
                                                        handleOperadorUnionChange(index, event.target.value)
                                                    }
                                                >
                                                    <MenuItem value="AND">AND</MenuItem>
                                                    <MenuItem value="OR">OR</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    )}
                                    <Grid item xs={12} sm={6} md={3} lg={3}>
                                        <FormControl fullWidth variant="outlined" style={{ marginBottom: '8px' }}>
                                            <Typography variant="h6" color="primary">
                                                Campo
                                            </Typography>
                                            <Select required
                                                value={filtro.columna}
                                                onChange={(event) =>
                                                    handleFiltroChange(index, 'columna', event.target.value)
                                                }
                                                label="Columna"
                                            >
                                                {columnasDisponibles.map((columna) => (
                                                    <MenuItem key={columna.column_name} value={columna.column_name}>
                                                        {columna.column_name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3} lg={3}>

                                        <FormControl fullWidth variant="outlined" style={{ marginBottom: '8px' }}>
                                            <Typography variant="h6" color="primary">
                                                Tipo de filtro
                                            </Typography>
                                            <Select required
                                                value={filtro.operador}
                                                onChange={(event) =>
                                                    handleFiltroChange(index, 'operador', event.target.value)
                                                }
                                            >
                                                <MenuItem value="=">Igual</MenuItem>
                                                <MenuItem value="!=">Distinto</MenuItem>
                                                <MenuItem value=">">Mayor que</MenuItem>
                                                <MenuItem value="<">Menor que</MenuItem>
                                                <MenuItem value="LIKE">Contiene</MenuItem>
                                                <MenuItem value="NOT LIKE">No contiene</MenuItem>
                                                <MenuItem value="IS NULL">Es NULL</MenuItem>
                                                <MenuItem value="IS NOT NULL">No es NULL</MenuItem>
                                            </Select>

                                        </FormControl>
                                    </Grid>

                                    {filtro.operador !== 'IS NULL' && filtro.operador !== 'IS NOT NULL' && (
                                        <>
                                            <Grid item xs={12} sm={6} md={3} lg={3}>
                                                <Typography variant="h6" color="primary">
                                                    Valor
                                                </Typography>
                                                <TextField fullWidth
                                                    value={filtro.valor}
                                                    onChange={(event) => handleFiltroChange(index, 'valor', event.target.value)}
                                                    required />
                                            </Grid>

                                        </>
                                    )}
                                    <Grid item xs={12} sm={1} md={1} lg={1} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <Tooltip title="Quitar filtro">
                                            <IconButton variant="outlined" color='naranja' size="large" onClick={() => handleQuitarFiltro(index)}>
                                                <Delete fontSize="inherit" />
                                            </IconButton>
                                        </Tooltip>
                                    </Grid>
                                </Grid>
                            ))}
                            < Button type="submit" variant="outlined" startIcon={<Add />} sx={{ width: 200 }} onClick={() => handleAgregarFiltro()} >
                                Agregar Filtro
                            </Button>
                        </div>
                    )}

                    <Button type="submit" variant="contained" startIcon={<Replay />} sx={{ mt: 2, width: 150 }}>
                        Generar Reporte
                    </Button>
                </form >
                {resultadoReporte.length > 0 && (
                    <CustomDataGrid rows={resultadoReporte} columns={columnasEnFormato} mensaje="No hay proyectos" />
                )}
            </Box>
        </div>
    );
}
