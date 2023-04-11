import * as React from 'react';
import { Box, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';

import "./InicioCmt.css";

const drawerWidth = 240;

function InicioCmt() {
  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>

      <Box sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer variant="permanent" sx={{ display: 'block', '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }, }} open        >
          {drawer}
        </Drawer>

      </Box>

      <Box
        sx={{ p: 1, width: { sm: `calc(100% - ${drawerWidth}px)` }, minHeight: '100vh', display: 'flex', flexDirection: 'column', }}      >
        <Typography paragraph>
          Inicio Comite
        </Typography>

      </Box>

    </Box>
  );
}

export default InicioCmt;