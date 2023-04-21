import React, { useState, useEffect } from "react";
import { DataGrid } from '@mui/x-data-grid';
import { Alert, Snackbar } from "@mui/material";

import { useSelector } from "react-redux";
import { selectToken } from "../../store/authSlice";


const columns = [
  { field: 'nombre', headerName: 'Nombre'  ,flex: 0.3 ,minWidth: 150},
  { field: 'codigo', headerName: 'Código'   ,flex: 0.15,minWidth: 100},
  { field: 'modalidad', headerName: 'Modalidad'  ,flex: 0.2,minWidth: 100},
  { field: 'etapa', headerName: 'Etapa'   ,flex: 0.2,minWidth: 100},
  { field: 'estado', headerName: 'Estado'  ,flex: 0.15,minWidth: 100}
];

export default function Proyectos() {

  const token = useSelector(selectToken);
  const [rows, setRows] = useState([]);

  const [error, setError] = useState(null);
  const handleClose = () => setError(null);

  const llenarTabla = async () => {
    try {
      const response = await fetch("http://localhost:5000/obtenerProyectos", {
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!data.success) {
        setError(data.message);
      } else {
        setRows(data.proyectos);
      }
    }
    catch (error) {
      setError("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.");
    }
  };

  useEffect(() => {
    llenarTabla();
  }, []);

  return (
    <div style={{ width: '100%' }}>
      {error && (
        <Snackbar open={true} autoHideDuration={6000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity="error" onClose={handleClose}>
            {error}
          </Alert>
        </Snackbar>
      )}
      <DataGrid 
        rows={rows}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[5]}   getRowHeight={() => 'auto'}
      />
    </div>
  );
}