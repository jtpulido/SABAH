import React, { useState } from "react";
import { DataGrid } from '@mui/x-data-grid';
import { Alert, Snackbar } from "@mui/material";

const columns = [
  { field: 'nombre', headerName: 'Nombre', width: 130 },
  { field: 'codigo', headerName: 'Código', width: 130 },
  { field: 'modalidad', headerName: 'Modalidad', width: 90 },
  { field: 'etapa', headerName: 'Etapa', width: 160 },
  { field: 'estado', headerName: 'Estado', width: 160 }
];

export default function Proyectos() {
  const [rows, setRows] = React.useState([]);

  const [error, setError] = useState(null);
  const handleClose = () => setError(null);

  const llenarTabla = async () => {
    try {
      const response = await fetch("http://localhost:5000/obtenerProyectos", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
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

  React.useEffect(() => {
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
