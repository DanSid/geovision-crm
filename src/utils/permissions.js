// ─────────────────────────────────────────────────────────────────────────────
// permissions.js  —  centralised permission helpers for GeoVision CRM
//
// Section keys map to the six SidebarMenu group names (lowercased):
//   '' (Dashboard) → 'dashboard'
//   'Sales'        → 'sales'
//   'Jira'         → 'jira'
//   'Logistics'    → 'logistics'
//   'Finance'      → 'finance'
//   'Account'      → 'account'
// ─────────────────────────────────────────────────────────────────────────────

export const SECTION_KEYS = ['dashboard', 'sales', 'jira', 'logistics', 'finance', 'account'];

export const SECTION_LABELS = {
    dashboard: 'Dashboard',
    sales:     'Sales',
    jira:      'Jira',
    logistics: 'Logistics',
    finance:   'Finance',
    account:   'Account',
};

export const SECTION_DESCRIPTIONS = {
    dashboard: 'Main overview, KPIs and metrics',
    sales:     'Contacts, companies, opportunities, pipeline and calendar',
    jira:      'Tasks, Kanban board, Gantt and Jira tracking',
    logistics: 'Equipment, vehicles, crew, requests and maintenance',
    finance:   'Invoices, billing and financial reports',
    account:   'Profile, settings and account preferences',
};

export const SECTION_ICONS = {
    dashboard: 'ri-dashboard-line',
    sales:     'ri-bar-chart-line',
    jira:      'ri-kanban-view',
    logistics: 'ri-truck-line',
    finance:   'ri-file-list-3-line',
    account:   'ri-user-settings-line',
};

// SidebarMenu group.group value → section key
export const GROUP_TO_KEY = {
    '':          'dashboard',
    'Sales':     'sales',
    'Jira':      'jira',
    'Logistics': 'logistics',
    'Finance':   'finance',
    'Account':   'account',
};

// Route path prefix → section key (more-specific prefixes first)
export const ROUTE_TO_SECTION = [
    { prefix: '/dashboard',                     key: 'dashboard' },
    { prefix: '/apps/contacts',                 key: 'sales'     },
    { prefix: '/apps/opportunities',            key: 'sales'     },
    { prefix: '/apps/customers',               key: 'sales'     },
    { prefix: '/apps/calendar',                key: 'sales'     },
    { prefix: '/apps/sales',                   key: 'sales'     },
    { prefix: '/apps/taskboard/pipeline',      key: 'sales'     },
    { prefix: '/apps/taskboard/summary',       key: 'sales'     },
    { prefix: '/apps/taskboard/projects-board',key: 'jira'      },
    { prefix: '/apps/taskboard/kanban-board',  key: 'jira'      },
    { prefix: '/apps/tasks',                   key: 'jira'      },
    { prefix: '/apps/todo',                    key: 'jira'      },
    { prefix: '/apps/jira',                    key: 'jira'      },
    { prefix: '/apps/logistics',               key: 'logistics' },
    { prefix: '/apps/accounts',               key: 'finance'   },
    { prefix: '/apps/invoices',               key: 'finance'   },
    { prefix: '/apps/finance',               key: 'finance'   },
    { prefix: '/pages',                       key: 'account'   },
    { prefix: '/settings',                    key: 'account'   },
];

export const DEFAULT_PERMISSIONS = {
    dashboard: true,
    sales:     true,
    jira:      true,
    logistics: true,
    finance:   true,
    account:   true,
};

// ── Migration: old key schema → new section keys ──────────────────────────────
// Old keys: dashboard, scrumboard, contacts, opportunities, customers,
//           calendar, tasks, accounts, settings
const migrateOld = (raw) => {
    if (!raw || typeof raw !== 'object') return {};
    // Already new schema if it has any new-style key
    if ('sales' in raw || 'jira' in raw || 'logistics' in raw || 'finance' in raw) {
        return raw;
    }
    return {
        dashboard: raw.dashboard !== false,
        // Sales: contacts OR opportunities OR customers OR calendar OR scrumboard must be allowed
        sales:     !(raw.contacts === false && raw.opportunities === false &&
                     raw.customers === false && raw.calendar === false),
        // Jira: tasks OR scrumboard
        jira:      !(raw.tasks === false && raw.scrumboard === false),
        // Logistics: wasn't in old schema → default true
        logistics: true,
        // Finance: accounts key
        finance:   raw.accounts !== false,
        // Account: settings key
        account:   raw.settings !== false,
    };
};

// ── Global permissions ────────────────────────────────────────────────────────
export const loadGlobalPermissions = () => {
    try {
        const d = localStorage.getItem('gv_crm_permissions');
        if (!d) return { ...DEFAULT_PERMISSIONS };
        const parsed = JSON.parse(d);
        const migrated = migrateOld(parsed);
        return { ...DEFAULT_PERMISSIONS, ...migrated };
    } catch { return { ...DEFAULT_PERMISSIONS }; }
};

export const saveGlobalPermissions = (perms) => {
    try { localStorage.setItem('gv_crm_permissions', JSON.stringify(perms)); } catch { /* ignore */ }
};

// ── Per-user permissions ──────────────────────────────────────────────────────
export const loadUserPermissions = (userId) => {
    if (!userId) return null;
    try {
        const d = localStorage.getItem(`gv_crm_user_perms_${userId}`);
        if (!d) return null; // null = "use global"
        const parsed = JSON.parse(d);
        return { ...DEFAULT_PERMISSIONS, ...migrateOld(parsed) };
    } catch { return null; }
};

export const saveUserPermissions = (userId, perms) => {
    try { localStorage.setItem(`gv_crm_user_perms_${userId}`, JSON.stringify(perms)); } catch { /* ignore */ }
};

export const clearUserPermissions = (userId) => {
    try { localStorage.removeItem(`gv_crm_user_perms_${userId}`); } catch { /* ignore */ }
};

// ── Effective permissions for a given user ────────────────────────────────────
// Admin   → always all true (bypasses every check)
// Non-admin with per-user overrides → per-user perms (Redux > localStorage > global)
// Non-admin without per-user perms  → global perms
//
// userOverrides: the Redux `userPermissions` state object (keyed by userId).
//   Passed in from Sidebar so that Supabase-synced changes trigger re-renders.
export const getEffectivePermissions = (user, globalPerms, userOverrides = {}) => {
    if (!user || user.role === 'admin') {
        return Object.fromEntries(SECTION_KEYS.map(k => [k, true]));
    }
    // Priority: Redux (Supabase-synced) > localStorage cache > global defaults
    const fromRedux = user.id ? userOverrides[user.id] : null;
    const fromLocal = loadUserPermissions(user.id);
    const perms = fromRedux || fromLocal;
    if (perms) return { ...DEFAULT_PERMISSIONS, ...perms };
    return { ...DEFAULT_PERMISSIONS, ...(globalPerms || {}) };
};

// ── Route access check ────────────────────────────────────────────────────────
export const isRouteAllowed = (pathname, effectivePerms) => {
    for (const { prefix, key } of ROUTE_TO_SECTION) {
        if (pathname.startsWith(prefix)) {
            return effectivePerms[key] !== false;
        }
    }
    return true; // unrecognised routes are always allowed
};
