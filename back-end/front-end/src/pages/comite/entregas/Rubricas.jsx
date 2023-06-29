import React, { } from "react";

import { tokens } from "../../../theme";
import { Box, Typography, useTheme, Divider } from "@mui/material";

import Item from "./Rubricas/Item"
import Rubrica from "./Rubricas/Rubrica"
export default function Rubricas() {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    return (
        <div style={{ margin: "15px" }} >
            <Typography
                variant="h1"
                color={colors.secundary[100]}
                fontWeight="bold"
            >
                ITEMS Y RUBRICAS DE CALIFICACIÓN
            </Typography>
            <Divider sx={{ mt: "15px", mb: "15px" }} />
            <Box>
                <Typography variant="h2" color={colors.primary[100]}>
                    ITEMS
                </Typography>
                <Item />
            </Box>
            <Divider sx={{ mt: "15px", mb: "15px" }} />
            <Box>
                <Typography variant="h2" color={colors.primary[100]}>
                    RUBRICAS
                </Typography>
                <Rubrica />
            </Box>
        </div>
    );
}