import React, { useState } from "react";
import { Button } from "@mui/material";
import { Typography, useTheme, Alert, Snackbar, Box, TextField, CssBaseline, TableContainer, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import "./InicioPro.css";
import { useSelector } from "react-redux";
import { selectToken } from "../../store/authSlice";

import { tokens } from "../../theme";


export default function Entregas() {

    const token = useSelector(selectToken);
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [error, setError] = useState(null);
    const handleClose = () => setError(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const handleFileSelect = (e) => {
      setSelectedFile(e.target.files[0]);
      
    }

    const handleFileUpload = async () => {
      const formData = new FormData();
      formData.append('file', selectedFile);
      console.log(selectedFile); 
      try {
        const response = await fetch("http://localhost:5000/proyecto/subirArchivo", {
          method: "POST",
          headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
          body: formData,
        });
  
      console.log(response);
      } catch (error) {
        // error al hacer la petición al servidor
        setError("Error al subir archivo");
      }
    };
    
  
    
  return (
    <div style={{ margin: "15px" }} >
      {error && (
        <Snackbar open={true} autoHideDuration={6000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity="error" onClose={handleClose}>
            {error}
          </Alert>
        </Snackbar>
      )}
      <CssBaseline />
      <Typography
        variant="h4"
        color={colors.secundary[100]}
      >
        ENTREGAS
      </Typography>
      <Typography
        variant="h5"
      >
        Artefactos De Control
      </Typography>
      <Typography
        variant="h5"
      >
        Documentos Del Proyecto
      </Typography>
      <Box >
        <Typography variant="h6" color={colors.secundary[100]} sx={{ mt: "20px", mb: "20px" }}>
          Pendientes
        </Typography>
        
      <TableContainer>
        <table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="h6" color={colors.primary[100]}>
                  Fecha Limite
                </Typography>
              </TableCell>
              <TableCell>
              <Typography variant="h6" color={colors.primary[100]}>
                Nombre 
                </Typography>
              </TableCell>
              <TableCell>
              <Typography variant="h6" color={colors.primary[100]}>
                Acción  
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>
                <TextField value="sdccsd" fullWidth />
              </TableCell>
              <TableCell>
              <TextField value="sdccsd" fullWidth />
              </TableCell>
              <TableCell>
                  <input type="file" onChange={handleFileSelect}  />
                  <Button onClick={handleFileUpload}>Subir archivo</Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </table>

        </TableContainer>  






        </Box>
    </div>
  );
}