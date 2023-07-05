import { ColorModeContext, useMode } from "./theme";
import { CssBaseline, ThemeProvider } from "@mui/material";

import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./Routes";
import { SnackbarProvider } from 'notistack';

export default function App() {

  const [theme, colorMode] = useMode();

  return (
    <SnackbarProvider maxSnack={3} anchorOrigin={{
      vertical: "top", // Posición superior
      horizontal: "right", // Centrado horizontalmente
    }}
      ContentProps={{
        style: {
          width: 100, // Ancho personalizado del Snackbar
        },
      }}>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter >
        </ThemeProvider>
      </ColorModeContext.Provider>
    </SnackbarProvider>
  )
}

