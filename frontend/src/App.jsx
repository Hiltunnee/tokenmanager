import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Inventory from "./pages/Inventory.jsx";
import Orders from "./pages/Orders.jsx";
import Colors from "./pages/Colors.jsx";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from '@mui/icons-material/Menu';

function App() {
  const [colors, setColors] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('Inventory');

  const apiBase = import.meta.env.VITE_API_URL || "";

  useEffect(() => {
    fetch(`${apiBase}/api/colors`)
      .then(res => res.json())
      .then(data => setColors(data));

    fetch(`${apiBase}/api/tokens`)
      .then(res => res.json())
      .then(data => setTokens(data));
  }, [apiBase]);

  useEffect(() => {console.log(colors)}, [colors]);
  useEffect(() => {console.log(tokens)}, [tokens]);

  const renderPage = () => {
    switch(currentPage) {
      case 'Inventory':
        return <Inventory colors={colors} setColors={setColors} tokens={tokens} setTokens={setTokens} />;
      case 'Orders':
        return <Orders />;
      case 'Colors':
        return <Colors colors={colors} setColors={setColors} />;
      default:
        return <Inventory colors={colors} setColors={setColors} tokens={tokens} setTokens={setTokens} />;
    }
  };

  return (
    <Box>
      <IconButton
        onClick={() => setOpen(true)}
        disabled={open}
        sx={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 1300,
          opacity: open ? 0 : 1,
          pointerEvents: open ? 'none' : 'auto',
        }}
      >
        <MenuIcon />
      </IconButton>
      <h1>Token management</h1>
        {renderPage()}
        <Drawer open={open} onClose={() => setOpen(false)}>
          <List>
            {['Inventory', 'Orders', 'Colors'].map((text) => (
              <ListItem key={text} disablePadding>
                <ListItemButton 
                  sx={{ width: 250, backgroundColor: currentPage === text ? '#f0f0f0' : 'transparent' }}
                  onClick={() => {
                    setCurrentPage(text);
                    setOpen(false);
                  }}
                >
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>
    </Box>
);}

export default App;
