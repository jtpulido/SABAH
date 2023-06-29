import React, { } from "react";


import PropTypes from 'prop-types';
import { IconButton, Collapse, useTheme, Typography, Table, TableHead, TableBody, TableRow, TableCell, Box } from '@mui/material';
import { tokens } from "../../../../theme";

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

export default function Row(props) {
    const { row } = props;
    const [open, setOpen] = React.useState(false);

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    return (
        <React.Fragment>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row" align="center">
                    {row.rubrica_id}
                </TableCell>
                <TableCell >{row.rubrica_nombre}</TableCell>
                <TableCell >{row.rubrica_descripcion}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Typography
                                variant="h4"
                                color={colors.secundary[100]}
                            >
                                Items
                            </Typography>
                            <Table>
                                <TableHead>

                                    <TableRow>
                                        <TableCell align="center">ID</TableCell>
                                        <TableCell align="center">NOMBRE</TableCell>
                                        <TableCell align="center">PUNTAJE</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {row.items.map((item) => (
                                        <TableRow key={item.item_id}>
                                            <TableCell component="th" scope="row" align="center">
                                                {item.item_id}
                                            </TableCell>
                                            <TableCell>{item.item_nombre}</TableCell>
                                            <TableCell align="right">{item.item_puntaje}</TableCell>

                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}

Row.propTypes = {
    row: PropTypes.shape({
        rubrica_id: PropTypes.number.isRequired,
        rubrica_nombre: PropTypes.string.isRequired,
        rubrica_descripcion: PropTypes.string.isRequired,
        items: PropTypes.arrayOf(
            PropTypes.shape({
                item_id: PropTypes.number.isRequired,
                item_puntaje: PropTypes.number.isRequired,
                item_nombre: PropTypes.string.isRequired,
            }),
        ).isRequired,
    }).isRequired,
};
