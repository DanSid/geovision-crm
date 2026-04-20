import {
    ADD_CONTACT, UPDATE_CONTACT, DELETE_CONTACT, INIT_CONTACTS,
    ADD_OPPORTUNITY, UPDATE_OPPORTUNITY, DELETE_OPPORTUNITY, INIT_OPPORTUNITIES,
    ADD_CUSTOMER, UPDATE_CUSTOMER, DELETE_CUSTOMER, INIT_CUSTOMERS,
    ADD_TASK, UPDATE_TASK, DELETE_TASK, TOGGLE_TASK, INIT_TASKS,
    SET_PERMISSION, RESET_PERMISSIONS, INIT_PERMISSIONS,
    ADD_BOARD, UPDATE_BOARD, DELETE_BOARD, INIT_BOARDS,
    SET_PIPELINE, INIT_PIPELINE,
    ADD_COMPANY, UPDATE_COMPANY, DELETE_COMPANY, INIT_COMPANIES,
    ADD_GROUP, UPDATE_GROUP, DELETE_GROUP, INIT_GROUPS,
    ADD_ACTIVITY, UPDATE_ACTIVITY, DELETE_ACTIVITY, INIT_ACTIVITIES,
    ADD_NOTE, DELETE_NOTE, INIT_NOTES,
    ADD_HISTORY_ENTRY, INIT_HISTORY,
    ADD_DOCUMENT, DELETE_DOCUMENT, INIT_DOCUMENTS,
    ADD_SECONDARY_CONTACT, UPDATE_SECONDARY_CONTACT, DELETE_SECONDARY_CONTACT, INIT_SECONDARY_CONTACTS,
    ADD_INVOICE, UPDATE_INVOICE, DELETE_INVOICE, INIT_INVOICES,
    ADD_EQUIPMENT, UPDATE_EQUIPMENT, DELETE_EQUIPMENT, INIT_EQUIPMENT,
    ADD_STOCK_LOCATION, UPDATE_STOCK_LOCATION, DELETE_STOCK_LOCATION, INIT_STOCK_LOCATIONS,
    ADD_CREW_MEMBER, UPDATE_CREW_MEMBER, DELETE_CREW_MEMBER, INIT_CREW_MEMBERS,
    ADD_VEHICLE, UPDATE_VEHICLE, DELETE_VEHICLE, INIT_VEHICLES,
    ADD_MAINTENANCE, UPDATE_MAINTENANCE, DELETE_MAINTENANCE, INIT_MAINTENANCE,
    ADD_REQUEST, UPDATE_REQUEST, DELETE_REQUEST, INIT_REQUESTS,
} from '../constants/Crm';

// ── LocalStorage helpers ──────────────────────────────────────────────────────
const load = (key, fallback = []) => {
    try {
        const d = localStorage.getItem(key);
        if (!d) return fallback;
        const parsed = JSON.parse(d);
        return Array.isArray(fallback) ? (Array.isArray(parsed) ? parsed : fallback) : parsed;
    } catch { return fallback; }
};
const save = (key, data) => {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* ignore */ }
};

// ── Default permissions ───────────────────────────────────────────────────────
const defaultPermissions = {
    dashboard: true, scrumboard: true, contacts: true,
    opportunities: true, customers: true, calendar: true,
    tasks: true, accounts: true, settings: true,
};
const loadPermissions = () => {
    try {
        const d = localStorage.getItem('gv_crm_permissions');
        return d ? { ...defaultPermissions, ...JSON.parse(d) } : defaultPermissions;
    } catch { return defaultPermissions; }
};

// ── Array CRUD reducer factory ────────────────────────────────────────────────
const makeArrayReducer = (key, ADD, UPDATE, DELETE, INIT, extra = {}) => {
    const init = load(key);
    return (state = init, action) => {
        let next;
        switch (action.type) {
            case INIT:
                save(key, action.payload);
                return action.payload;
            case ADD:
                next = [...state, action.payload];
                save(key, next);
                return next;
            case UPDATE:
                next = state.map(i => i.id === action.payload.id ? action.payload : i);
                save(key, next);
                return next;
            case DELETE:
                next = state.filter(i => i.id !== action.payload);
                save(key, next);
                return next;
            default:
                if (extra[action.type]) return extra[action.type](state, action, save, key);
                return state;
        }
    };
};

// ── Reducers ──────────────────────────────────────────────────────────────────

export const contactsReducer = makeArrayReducer(
    'gv_crm_contacts', ADD_CONTACT, UPDATE_CONTACT, DELETE_CONTACT, INIT_CONTACTS
);

export const opportunitiesReducer = makeArrayReducer(
    'gv_crm_opportunities', ADD_OPPORTUNITY, UPDATE_OPPORTUNITY, DELETE_OPPORTUNITY, INIT_OPPORTUNITIES
);

export const customersReducer = makeArrayReducer(
    'gv_crm_customers', ADD_CUSTOMER, UPDATE_CUSTOMER, DELETE_CUSTOMER, INIT_CUSTOMERS
);

export const tasksReducer = makeArrayReducer(
    'gv_crm_tasks', ADD_TASK, UPDATE_TASK, DELETE_TASK, INIT_TASKS,
    {
        [TOGGLE_TASK]: (state, action, sv, key) => {
            const next = state.map(t => t.id === action.payload ? { ...t, done: !t.done } : t);
            sv(key, next);
            return next;
        },
    }
);

export const boardsReducer = makeArrayReducer(
    'gv_crm_boards', ADD_BOARD, UPDATE_BOARD, DELETE_BOARD, INIT_BOARDS
);

export const companiesReducer = makeArrayReducer(
    'gv_crm_companies', ADD_COMPANY, UPDATE_COMPANY, DELETE_COMPANY, INIT_COMPANIES
);

export const groupsReducer = makeArrayReducer(
    'gv_crm_groups', ADD_GROUP, UPDATE_GROUP, DELETE_GROUP, INIT_GROUPS
);

export const activitiesReducer = makeArrayReducer(
    'gv_crm_activities', ADD_ACTIVITY, UPDATE_ACTIVITY, DELETE_ACTIVITY, INIT_ACTIVITIES
);

export const notesReducer = makeArrayReducer(
    'gv_crm_notes', ADD_NOTE, null, DELETE_NOTE, INIT_NOTES,
    {
        [DELETE_NOTE]: (state, action, sv, key) => {
            const next = state.filter(n => n.id !== action.payload);
            sv(key, next);
            return next;
        },
    }
);

export const historyReducer = makeArrayReducer(
    'gv_crm_history', ADD_HISTORY_ENTRY, null, null, INIT_HISTORY
);

export const documentsReducer = makeArrayReducer(
    'gv_crm_documents', ADD_DOCUMENT, null, DELETE_DOCUMENT, INIT_DOCUMENTS,
    {
        [DELETE_DOCUMENT]: (state, action, sv, key) => {
            const next = state.filter(d => d.id !== action.payload);
            sv(key, next);
            return next;
        },
    }
);

export const secondaryContactsReducer = makeArrayReducer(
    'gv_crm_secondary_contacts', ADD_SECONDARY_CONTACT, UPDATE_SECONDARY_CONTACT, DELETE_SECONDARY_CONTACT, INIT_SECONDARY_CONTACTS
);

export const invoicesReducer = makeArrayReducer(
    'gv_crm_invoices', ADD_INVOICE, UPDATE_INVOICE, DELETE_INVOICE, INIT_INVOICES
);

export const equipmentReducer = makeArrayReducer(
    'gv_crm_equipment', ADD_EQUIPMENT, UPDATE_EQUIPMENT, DELETE_EQUIPMENT, INIT_EQUIPMENT
);

export const stockLocationsReducer = makeArrayReducer(
    'gv_crm_stock_locations', ADD_STOCK_LOCATION, UPDATE_STOCK_LOCATION, DELETE_STOCK_LOCATION, INIT_STOCK_LOCATIONS
);

export const crewMembersReducer = makeArrayReducer(
    'gv_crm_crew_members', ADD_CREW_MEMBER, UPDATE_CREW_MEMBER, DELETE_CREW_MEMBER, INIT_CREW_MEMBERS
);

export const vehiclesReducer = makeArrayReducer(
    'gv_crm_vehicles', ADD_VEHICLE, UPDATE_VEHICLE, DELETE_VEHICLE, INIT_VEHICLES
);

export const maintenanceReducer = makeArrayReducer(
    'gv_crm_maintenance', ADD_MAINTENANCE, UPDATE_MAINTENANCE, DELETE_MAINTENANCE, INIT_MAINTENANCE
);

export const requestsReducer = makeArrayReducer(
    'gv_crm_requests', ADD_REQUEST, UPDATE_REQUEST, DELETE_REQUEST, INIT_REQUESTS
);

// ── Permissions Reducer ───────────────────────────────────────────────────────
export const permissionsReducer = (state = loadPermissions(), action) => {
    let next;
    switch (action.type) {
        case INIT_PERMISSIONS:
            next = { ...defaultPermissions, ...(action.payload || {}) };
            save('gv_crm_permissions', next);
            return next;
        case SET_PERMISSION:
            next = { ...state, [action.payload.key]: action.payload.value };
            save('gv_crm_permissions', next);
            return next;
        case RESET_PERMISSIONS:
            save('gv_crm_permissions', defaultPermissions);
            return defaultPermissions;
        default:
            return state;
    }
};

// ── Pipeline Reducer ──────────────────────────────────────────────────────────
const loadPipeline = () => {
    try { const d = localStorage.getItem('gv_crm_pipeline'); return d ? JSON.parse(d) : null; }
    catch { return null; }
};
export const pipelineReducer = (state = loadPipeline(), action) => {
    switch (action.type) {
        case INIT_PIPELINE:
            try { localStorage.setItem('gv_crm_pipeline', JSON.stringify(action.payload)); } catch { /* ignore */ }
            return action.payload;
        case SET_PIPELINE:
            try { localStorage.setItem('gv_crm_pipeline', JSON.stringify(action.payload)); } catch { /* ignore */ }
            return action.payload;
        default:
            return state;
    }
};
