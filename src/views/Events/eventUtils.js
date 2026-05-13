export const STATUS_COLORS = {
    completed: '#10b981',
    upcoming:  '#3b82f6',
    planned:   '#f59e0b',
};

export const STATUS_LABELS = {
    completed: 'Completed',
    upcoming:  'Upcoming',
    planned:   'Planned',
};

export const STATUS_BADGE = {
    completed: 'success',
    upcoming:  'primary',
    planned:   'warning',
};

export const DEL_STATUS_COLORS = {
    planned:     '#f59e0b',
    in_progress: '#3b82f6',
    completed:   '#10b981',
};

export const DEL_STATUS_LABELS = {
    planned:     'Planned',
    in_progress: 'In progress',
    completed:   'Completed',
};

export const PALETTE = [
    '#6366f1','#10b981','#8b5cf6','#f59e0b','#ef4444',
    '#14b8a6','#3b82f6','#ec4899','#64748b','#84cc16',
    '#f97316','#0ea5e9','#a855f7','#22c55e',
];

export const fmtDate = (d) => {
    if (!d) return '—';
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const fmtBudget = (b) =>
    b ? 'GHS ' + Number(b).toLocaleString() : '—';

export const delPct = (dels) => {
    if (!dels || !dels.length) return 0;
    return Math.round(dels.filter(d => d.status === 'completed').length / dels.length * 100);
};

export const getCity = (venue = '') => {
    const v = venue.toLowerCase();
    if (/johannesburg|south africa|protea|wanderers/.test(v)) return 'Johannesburg';
    if (/tema|ike/.test(v))            return 'Tema';
    if (/akwadum|eastern/.test(v))     return 'Eastern Region';
    if (/manso/.test(v))               return 'Manso Nkran';
    if (/gbawe/.test(v))               return 'Gbawe';
    if (/western serene/.test(v))      return 'Western Region';
    return 'Accra';
};

export const getPrimaryLead = (lead = '') => lead.split('/')[0].trim();
