import React, { useState, useEffect } from "react";
import { DataGrid } from '@mui/x-data-grid';
import { Alert, Snackbar } from "@mui/material";

import { useSelector } from "react-redux";
import { selectToken } from "../../store/authSlice";

const columns = [
  { field: 'nombre', headerName: 'Nombre', width: 130 },
  { field: 'codigo', headerName: 'Código', width: 130 },
  { field: 'modalidad', headerName: 'Modalidad', width: 90 },
  { field: 'etapa', headerName: 'Etapa', width: 160 },
  { field: 'estado', headerName: 'Estado', width: 160 }
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
    <div style={{ height: 400, width: '100%' }}>
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
        pageSize={5}
        rowsPerPageOptions={[5]}
        checkboxSelection
      />
    </div>
  );
}