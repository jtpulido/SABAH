import React, { useState, useEffect } from "react";
import { Box, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import { DataGrid, GridToolbarContainer, GridToolbarFilterButton, GridToolbarExport } from '@mui/x-data-grid';

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <div style={{ display: 'flex', gap: '20px' }}>
        <GridToolbarFilterButton />
        <GridToolbarExport />
      </div>
    </GridToolbarContainer>
  );
}

export default function CustomDataGrid({ rows = [], columns, mensaje }) {
  const [height, setHeight] = useState('200px');
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  useEffect(() => {
    setHeight(rows.length > 0 ? 'auto' : '200px');
  }, [rows]);

  const updatedColumns = columns.map((column) => ({
    ...column,
    align: "center",
    headerAlign: "center",
  }));

  return (
    <Box sx={{
      height,
      "& .MuiDataGrid-root": {
        border: "none",
      },
      "& .MuiDataGrid-cellContent": {
        textAlign: "center"
      },
      "& .MuiDataGrid-columnHeaders": {
        color: colors.primary[100],
        textAlign: "center",
        fontSize: 14,
      },
      "& .MuiDataGrid-columnHeaderTitle": {
        whiteSpace: "normal",
        textAlign: "center",
        lineHeight: "1.2",
      },
      "& .MuiDataGrid-toolbarContainer": {
        justifyContent: 'flex-end',
        align: "right"
      }
    }}>
      <DataGrid

        getRowHeight={() => 'auto'}
        rows={rows}
        columns={updatedColumns}
        components={{
          Toolbar: CustomToolbar,
          NoRowsOverlay: () => CustomNoRowsMessage(mensaje)
        }}
        disableColumnSelector
        disableRowSelectionOnClick
      />
    </Box>
  );
}

const CustomNoRowsMessage = (mensaje) => {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      {mensaje}
    </div>
  );
}
