import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button, Alert, Link, Grid, MenuItem, Chip, FormControl, InputLabel,
  Select, OutlinedInput, FormHelperText, Checkbox, FormControlLabel, Stack,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { validateRegister, errMsg, fieldErrors } from '../utils/validation';
import { COUNTRIES, ROLES, INTERESTS, NOTIFICATIONS } from '../utils/constants';
import axiosInstance from '../api/axiosInstance';
import http from '../services/http';

const initial = {
  fullName: '', email: '', phone: '', country: '', role: '',
  interests: [], notifications: [], password: '', confirmPassword: '', terms: false,
};

function MultiSelect({ label, name, options, value, onChange, error }) {
  return (
    <FormControl fullWidth error={!!error}>
      <InputLabel>{label}</InputLabel>
      <Select multiple name={name} value={value} onChange={onChange} input={<OutlinedInput label={label} />}
        renderValue={(sel) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>{sel.map((s) => <Chip key={s} label={s} size="small" />)}</Box>
        )}>
        {options.map((o) => (
          <MenuItem key={o} value={o}><Checkbox checked={value.includes(o)} />{o}</MenuItem>
        ))}
      </Select>
      <FormHelperText>{error}</FormHelperText>
    </FormControl>
  );
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [v, setV] = useState(initial);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [busy, setBusy] = useState(false);

  const bind = (name) => ({
    name, value: v[name], error: !!errors[name], helperText: errors[name],
    onChange: (e) => setV((p) => ({ ...p, [name]: e.target.value })),
  });

  const submit = async (e) => {
    e.preventDefault();
    const errs = validateRegister(v);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true); setApiError('');
    try {
      const registerUser = await http.post("/register", { ...v, fullName: v.fullName.trim(), email: v.email.trim().toLowerCase(), phone: v.phone.replace(/[\s-]/g, '') });
      if(registerUser.status === 200){
        navigate('/', { replace: true });
      } else {
        setApiError(errMsg(registerUser.message));
      }
      // await register({ ...v, fullName: v.fullName.trim(), email: v.email.trim().toLowerCase(), phone: v.phone.replace(/[\s-]/g, '') });
    } catch (err) {
      setApiError(errMsg(err));
      setErrors(fieldErrors(err));
    } finally { setBusy(false); }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}>
      <Paper sx={{ p: 4, width: '100%', maxWidth: 720 }} elevation={2}>
        <Typography variant="h4" gutterBottom>Create your account</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>Tell us a little so we can tailor your reminders.</Typography>
        {apiError && <Alert severity="error" sx={{ mb: 2 }}>{apiError}</Alert>}
        <form onSubmit={submit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Full name" autoComplete="name" {...bind('fullName')} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Email" type="email" autoComplete="email" {...bind('email')} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Phone" autoComplete="tel" placeholder="+919876543210" {...bind('phone')} /></Grid>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth label="Country" {...bind('country')}>
                {COUNTRIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField select fullWidth label="Role" {...bind('role')}>
                {ROLES.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <MultiSelect label="Interests (multi-select)" name="interests" options={INTERESTS} value={v.interests}
                error={errors.interests} onChange={(e) => setV({ ...v, interests: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MultiSelect label="Notify me via (multi-select)" name="notifications" options={NOTIFICATIONS} value={v.notifications}
                error={errors.notifications} onChange={(e) => setV({ ...v, notifications: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Password" type="password" autoComplete="new-password" {...bind('password')} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Confirm password" type="password" autoComplete="new-password" {...bind('confirmPassword')} /></Grid>
            <Grid item xs={12}>
              <FormControl error={!!errors.terms}>
                <FormControlLabel control={<Checkbox checked={v.terms} onChange={(e) => setV({ ...v, terms: e.target.checked })} />}
                  label="I accept the terms and privacy policy" />
                <FormHelperText>{errors.terms}</FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Stack spacing={2}>
                <Button type="submit" variant="contained" size="large" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</Button>
                <Typography variant="body2">Already registered? <Link component={RouterLink} to="/login">Sign in</Link></Typography>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}
