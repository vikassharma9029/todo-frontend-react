import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Grid, Paper, Typography, Box, LinearProgress, Alert, Skeleton, Button, List, ListItem, ListItemText } from '@mui/material';
import { Assignment, Autorenew, CheckCircle, WarningAmber } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { todoApi } from '../services/todoService';
import { errMsg } from '../utils/validation';
import { STATUSES, PRIORITIES } from '../utils/constants';
import { StatusChip, PriorityChip } from '../components/Chips';

const Stat = ({ icon, label, value, color }) => (
  <Paper sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
    <Box sx={{ color, display: 'flex' }}>{icon}</Box>
    <Box>
      <Typography variant="h4">{value}</Typography>
      <Typography color="text.secondary">{label}</Typography>
    </Box>
  </Paper>
);

const Breakdown = ({ title, items, data, total }) => (
  <Paper sx={{ p: 3 }}>
    <Typography variant="h6" gutterBottom>{title}</Typography>
    {items.map((i) => (
      <Box key={i.value} sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2">{i.label}</Typography>
          <Typography variant="body2">{data[i.value]}</Typography>
        </Box>
        <LinearProgress variant="determinate" value={total ? (data[i.value] / total) * 100 : 0} sx={{ height: 8, borderRadius: 4 }}
          color={i.color === 'default' ? 'inherit' : i.color} />
      </Box>
    ))}
  </Paper>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([todoApi.stats(), todoApi.list({ page: 1, limit: 5, sortBy: 'createdAt', order: 'desc' })])
      .then(([s, l]) => { setStats(s.data[0]); setRecent(l.data); })
      .catch((e) => setError(errMsg(e)));
  }, []);

  return (
    <Box>
      <Typography variant="h4">Hello, {user.fullName.split(' ')[0]}</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>Here is where your tasks stand today.</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {!stats ? <Skeleton variant="rounded" height={260} /> : (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}><Stat icon={<Assignment fontSize="large" />} label="Total tasks" value={stats.total} color="primary.main" /></Grid>
          <Grid item xs={12} sm={6} md={3}><Stat icon={<Autorenew fontSize="large" />} label="In progress" value={stats.byStatus.in_progress} color="info.main" /></Grid>
          <Grid item xs={12} sm={6} md={3}><Stat icon={<CheckCircle fontSize="large" />} label="Completed" value={stats.byStatus.done} color="success.main" /></Grid>
          <Grid item xs={12} sm={6} md={3}><Stat icon={<WarningAmber fontSize="large" />} label="Overdue" value={stats.overdue} color="error.main" /></Grid>
          <Grid item xs={12} md={6}><Breakdown title="By status" items={STATUSES} data={stats.byStatus} total={stats.total} /></Grid>
          <Grid item xs={12} md={6}><Breakdown title="By priority" items={PRIORITIES} data={stats.byPriority} total={stats.total} /></Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Recently added</Typography>
                <Button component={RouterLink} to="/todos">View all</Button>
              </Box>
              <List>
                {recent.map((t) => (
                  <ListItem key={t.id} divider secondaryAction={<Box sx={{ display: 'flex', gap: 1 }}><PriorityChip value={t.priority} /><StatusChip value={t.status} /></Box>}>
                    <ListItemText primary={t.title} secondary={t.dueDate ? `Due ${t.dueDate}` : 'No due date'} />
                  </ListItem>
                ))}
                {!recent.length && <Typography color="text.secondary" sx={{ py: 2 }}>No tasks yet. Add your first one from the Todos page.</Typography>}
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
