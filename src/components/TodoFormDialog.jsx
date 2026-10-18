import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Stack, Alert } from '@mui/material';
import { STATUSES, PRIORITIES } from '../utils/constants';
import { validateTodo, errMsg, fieldErrors } from '../utils/validation';

const empty = { title: '', description: '', status: 'todo', priority: 'medium', dueDate: '' };

export default function TodoFormDialog({ open, todo, onClose, onSubmit }) {
  const [v, setV] = useState(empty);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) { setV(todo ? { ...empty, ...todo } : empty); setErrors({}); setApiError(''); }
  }, [open, todo]);

  const bind = (name) => ({ value: v[name], error: !!errors[name], helperText: errors[name], onChange: (e) => setV({ ...v, [name]: e.target.value }) });

  const save = async () => {
    const errs = validateTodo(v);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true); setApiError('');
    try {
      await onSubmit({ title: v.title.trim(), description: v.description.trim(), status: v.status, priority: v.priority, dueDate: v.dueDate });
    } catch (e) { setApiError(errMsg(e)); setErrors(fieldErrors(e)); }
    finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{todo ? 'Edit task' : 'New task'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {apiError && <Alert severity="error">{apiError}</Alert>}
          <TextField label="Title" autoFocus required {...bind('title')} />
          <TextField label="Description" multiline minRows={3} {...bind('description')} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField select fullWidth label="Status" {...bind('status')}>
              {STATUSES.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
            </TextField>
            <TextField select fullWidth label="Priority" {...bind('priority')}>
              {PRIORITIES.map((p) => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
            </TextField>
          </Stack>
          <TextField label="Due date" type="date" InputLabelProps={{ shrink: true }} {...bind('dueDate')} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={busy}>Cancel</Button>
        <Button variant="contained" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save task'}</Button>
      </DialogActions>
    </Dialog>
  );
}
