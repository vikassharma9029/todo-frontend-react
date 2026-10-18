import { createTheme } from '@mui/material';
export default createTheme({
  palette: {
    primary: { main: '#1f5f5b' },
    secondary: { main: '#c2571a' },
    background: { default: '#f4f6f6' },
  },
  shape: { borderRadius: 8 },
  typography: { fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif', h4: { fontWeight: 700 } },
});
