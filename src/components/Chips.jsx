import { Chip } from '@mui/material';
import { STATUSES, PRIORITIES } from '../utils/constants';

const make = (list) => ({ value }) => {
  const o = list.find((x) => x.value === value);
  return <Chip size="small" label={o?.label || value} color={o?.color || 'default'} variant={o?.color === 'default' ? 'outlined' : 'filled'} />;
};
export const StatusChip = make(STATUSES);
export const PriorityChip = make(PRIORITIES);
