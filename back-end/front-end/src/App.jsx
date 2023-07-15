import { ColorModeContext, useMode } from "./theme";
import { CssBaseline, ThemeProvider } from "@mui/material";

import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./Routes";
import { SnackbarProvider } from 'notistack';
import { MaterialDesignContent } from 'notistack'
import { styled } from '@mui/system';


export default function App() {

  const StyledMaterialDesignContent = styled(MaterialDesignContent)(() => ({
    '&.notistack-MuiContent-success': {
      backgroundColor: '#8db33aD9',
    },
    '&.notistack-MuiContent-error': {
      backgroundColor: '#CB3234D9',
    },
    '&.notistack-MuiContent-info': {
      backgroundColor: '#00917CD9',
    },
    '&.notistack-MuiContent-warning': {
      backgroundColor: '#ec8a01D9',
    },
  }));


  const [theme, colorMode] = useMode();

  return (
    <SnackbarProvider
      maxSnack={6}
      preventDuplicate
      autoHideDuration={3500}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      Components={{
        success: StyledMaterialDesignContent,
        error: StyledMaterialDesignContent,
        info: StyledMaterialDesignContent,
        warning: StyledMaterialDesignContent
      }}
    >
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