import { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { Box, Paper, Typography, TextField, Button, Alert, Link, InputAdornment, IconButton, Stack } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { validateLogin, errMsg, getCookie } from '../utils/validation';
import http from '../services/http';
import { tokenStore } from '../services/tokenStore';

export default function Login() {
  const { login, setUser } = useAuth();
  const navigate = useNavigate();
  const from = useLocation().state?.from || '/';
  const [v, setV] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);


  const submit = async (e) => {
    e.preventDefault();
    const errs = validateLogin(v);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true); setApiError('');
    try {
      const res = await http.post('/login', { email: v.email.trim(), password: v.password });
      const token = getCookie('token');       // null if the cookie is httpOnly, which is fine
      if (token) tokenStore.set(token);
      setUser(res.data.data);                 // your API returns the user under data.data
      navigate(from, { replace: true });
    } catch (err) {
      setApiError(errMsg(err));               // pass the error, not a status number
    } finally { setBusy(false); }
  };

  // const submit = async (e) => {
  //   e.preventDefault();
  //   const errs = validateLogin(v);
  //   setErrors(errs);
  //   if (Object.keys(errs).length) return;
  //   setBusy(true); setApiError('');
  //   try {
  //     debugger;
  //     const loginCheck = await http.post("/login", { email: v.email.trim(), password: v.password });
  //     if(loginCheck.status === 200){

  //      const cookieValue = getCookie("token");

  //       tokenStore.set(cookieValue);
  //       setUser(loginCheck.data.data);
  //       navigate(from, { replace: true }); 
  //     } else {
  //       setApiError(errMsg(loginCheck.status))
  //     }
  //     //  await login({ email: v.email.trim(), password: v.password }); 
  //   }
  //   catch (err) { setApiError(errMsg(err)); }
  //   finally { setBusy(false); }
  // };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}>
      <Paper sx={{ p: 4, width: '100%', maxWidth: 420 }} elevation={2}>
        <Typography variant="h4" gutterBottom>Sign in</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>Pick up where your task list left off.</Typography>
        <Alert severity="info" sx={{ mb: 2 }}>Demo: demo@example.com / Demo@1234</Alert>
        {apiError && <Alert severity="error" sx={{ mb: 2 }}>{apiError}</Alert>}
        <Stack component="form" spacing={2} onSubmit={submit} noValidate>
          <TextField label="Email" type="email" autoComplete="email" value={v.email}
            onChange={(e) => setV({ ...v, email: e.target.value })} error={!!errors.email} helperText={errors.email} />
          <TextField label="Password" type={show ? 'text' : 'password'} autoComplete="current-password" value={v.password}
            onChange={(e) => setV({ ...v, password: e.target.value })} error={!!errors.password} helperText={errors.password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton aria-label="Toggle password visibility" onClick={() => setShow(!show)} edge="end">
                    {show ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>)
            }} />
          <Button type="submit" variant="contained" size="large" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</Button>
        </Stack>
        <Typography sx={{ mt: 3 }} variant="body2">
          New here? <Link component={RouterLink} to="/register">Create an account</Link>
        </Typography>
      </Paper>
    </Box>
  );
}
