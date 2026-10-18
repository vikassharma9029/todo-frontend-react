import { useCallback, useEffect, useState } from 'react';
import {
  Box, Typography, Button, Paper, TextField, MenuItem, InputAdornment, Table, TableHead, TableRow, TableCell, TableBody,
  TableSortLabel, TablePagination, TableContainer, IconButton, Select, Snackbar, Alert, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, LinearProgress, Tooltip, Stack,
} from '@mui/material';
import { Add, Search, Edit, Delete } from '@mui/icons-material';
import { todoApi } from '../services/todoService';
import { STATUSES, PRIORITIES } from '../utils/constants';
import { errMsg } from '../utils/validation';
import TodoFormDialog from '../components/TodoFormDialog';
import http from '../services/http';

const COLUMNS = [
  { id: 'title', label: 'Title', sortable: true },
  { id: 'status', label: 'Status', sortable: true },
  { id: 'priority', label: 'Priority', sortable: true },
  { id: 'dueDate', label: 'Due date', sortable: true },
  { id: 'actions', label: 'Actions', align: 'right' },
];

const isOverdue = (t) => t.dueDate && t.status !== 'done' && t.dueDate < new Date().toISOString().slice(0, 10);

export default function Todos() {
  const [q, setQ] = useState({ page: 0, limit: 10, search: '', status: '', priority: '', sortBy: 'createdAt', order: 'desc' });
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ open: false, todo: null });
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setQ((p) => (p.search === search ? p : { ...p, search, page: 0 })), 400);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await todoApi.list({ ...q, page: q.page + 1 });
      setRows(r.data); setTotal(r.total);
    } catch (e) { setToast({ severity: 'error', msg: errMsg(e) }); }
    finally { setLoading(false); }
  }, [q]);
  useEffect(() => { load(); }, [load]);

  const setFilter = (name) => (e) => setQ({ ...q, [name]: e.target.value, page: 0 });
  const sortBy = (id) => setQ({ ...q, sortBy: id, order: q.sortBy === id && q.order === 'asc' ? 'desc' : 'asc', page: 0 });

  const save = async (payload) => {
    if (form.todo) {
      await todoApi.update(form.todo._id, payload);
    }  else {
      await http.post("/todos", payload);
    }
    setToast({ severity: 'success', msg: form.todo ? 'Task updated' : 'Task created' });
    setForm({ open: false, todo: null });
    load();
  };
  const quickUpdate = async (t, patch) => {
    setRows((rs) => rs.map((r) => (r.id === t.id ? { ...r, ...patch } : r))); // optimistic
    try { await todoApi.update(t.id, patch); } catch (e) { setToast({ severity: 'error', msg: errMsg(e) }); load(); }
  };
  const remove = async () => {
    try {
      await todoApi.remove(confirm.id);
      setToast({ severity: 'success', msg: 'Task deleted' });
      if (rows.length === 1 && q.page > 0) setQ({ ...q, page: q.page - 1 }); else load();
    } catch (e) { setToast({ severity: 'error', msg: errMsg(e) }); }
    setConfirm(null);
  };

  const mini = (list, value, onChange) => (
    <Select size="small" value={value} onChange={(e) => onChange(e.target.value)} sx={{ minWidth: 130 }}>
      {list.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
    </Select>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4">Todos</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setForm({ open: true, todo: null })}>New task</Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField fullWidth size="small" placeholder="Search title or description" value={search} onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }} />
          <TextField select size="small" label="Status" value={q.status} onChange={setFilter('status')} sx={{ minWidth: 160 }}>
            <MenuItem value="">All</MenuItem>
            {STATUSES.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="Priority" value={q.priority} onChange={setFilter('priority')} sx={{ minWidth: 160 }}>
            <MenuItem value="">All</MenuItem>
            {PRIORITIES.map((p) => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
          </TextField>
        </Stack>
      </Paper>

      <Paper>
        {loading && <LinearProgress />}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {COLUMNS.map((c) => (
                  <TableCell key={c.id} align={c.align} sortDirection={q.sortBy === c.id ? q.order : false}>
                    {c.sortable ? (
                      <TableSortLabel active={q.sortBy === c.id} direction={q.sortBy === c.id ? q.order : 'asc'} onClick={() => sortBy(c.id)}>{c.label}</TableSortLabel>
                    ) : c.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((t) => (
                <TableRow key={t.id} hover>
                  <TableCell sx={{ maxWidth: 320 }}>
                    <Typography fontWeight={600} sx={{ textDecoration: t.status === 'done' ? 'line-through' : 'none' }}>{t.title}</Typography>
                    {t.description && <Typography variant="body2" color="text.secondary" noWrap>{t.description}</Typography>}
                  </TableCell>
                  <TableCell>{mini(STATUSES, t.status, (status) => quickUpdate(t, { status }))}</TableCell>
                  <TableCell>{mini(PRIORITIES, t.priority, (priority) => quickUpdate(t, { priority }))}</TableCell>
                  <TableCell sx={{ color: isOverdue(t) ? 'error.main' : 'inherit', fontWeight: isOverdue(t) ? 600 : 400 }}>
                    {t.dueDate || '—'}{isOverdue(t) && ' (overdue)'}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit"><IconButton onClick={() => setForm({ open: true, todo: t })}><Edit /></IconButton></Tooltip>
                    <Tooltip title="Delete"><IconButton color="error" onClick={() => setConfirm(t)}><Delete /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && !rows.length && (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">No tasks match. Clear the filters or add a new task.</Typography>
                </TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={total} page={q.page} rowsPerPage={q.limit} rowsPerPageOptions={[5, 10, 25]}
          onPageChange={(_, page) => setQ({ ...q, page })} onRowsPerPageChange={(e) => setQ({ ...q, limit: +e.target.value, page: 0 })} />
      </Paper>

      <TodoFormDialog open={form.open} todo={form.todo} onClose={() => setForm({ open: false, todo: null })} onSubmit={save} />

      <Dialog open={!!confirm} onClose={() => setConfirm(null)}>
        <DialogTitle>Delete task?</DialogTitle>
        <DialogContent><DialogContentText>"{confirm?.title}" will be permanently removed.</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={remove}>Delete task</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!toast} autoHideDuration={3500} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        {toast ? <Alert severity={toast.severity} onClose={() => setToast(null)} variant="filled">{toast.msg}</Alert> : undefined}
      </Snackbar>
    </Box>
  );
}
