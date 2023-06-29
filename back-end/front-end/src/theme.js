import { createContext, useState, useMemo } from "react";

import { createTheme } from "@mui/material/styles";

export const tokens = () => ({

    primary: {
        100: "#576a3d"
    },
    secundary: {
        100: "#8db33a"
    },
    naranja: {
        100: "#ec8a01"
    }
})

// mui theme settings
export const themeSettings = (mode) => {
    const colors = tokens(mode);
    return {
        palette: {

            primary: {
                main: colors.primary[100]
            },
            secondary: {
                main: colors.secundary[100]
            }, naranja: {
                main: colors.naranja[100]
            }
        },
        typography: {
            fontFamily: ["Montserrat", "sans-serif"].join(","),
            fontSize: 12,
            h1: {
                fontFamily: ["Montserrat", "sans-serif"].join(","),
                fontSize: 25
            },
            h2: {
                fontFamily: ["Montserrat", "sans-serif"].join(","),
                fontSize: 20
            },
            h3: {
                fontFamily: ["Montserrat", "sans-serif"].join(","),
                fontSize: 18
            },
            h4: {
                fontFamily: ["Montserrat", "sans-serif"].join(","),
                fontSize: 16
            },
            h5: {
                fontFamily: ["Montserrat", "sans-serif"].join(","),
                fontSize: 14
            },
            h6: {
                fontFamily: ["Montserrat", "sans-serif"].join(","),
                fontSize: 13
            }
        }
    };
};

export const ColorModeContext = createContext({
    toggleColorMode: () => { }
});

export const useMode = () => {
    const [mode, setMode] = useState("dark");
    const colorMode = useMemo(
        () => ({
            toggleColorMode: () =>
                setMode((prevMode) => (prevMode === "dark" ? "light" : "dark"))
        }),
        []
    );

    const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);

    return [theme, colorMode];
};
