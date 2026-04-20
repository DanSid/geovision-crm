import axios from 'axios';

// In development Vite proxies /api → localhost:3001.
// In production set VITE_API_URL to your deployed backend URL (e.g. https://api.geovisioncrm.com).
const BASE = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api';

const api = axios.create({
    baseURL: BASE,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
});

// Normalize _id → id on every response item
const normalize = (item) => {
    if (!item || typeof item !== 'object') return item;
    const n = { ...item };
    if (n._id !== undefined && n.id === undefined) n.id = String(n._id);
    else if (n._id !== undefined) n.id = String(n._id);
    return n;
};

api.interceptors.response.use(
    (response) => {
        const { data } = response;
        if (Array.isArray(data)) response.data = data.map(normalize);
        else if (data && typeof data === 'object') response.data = normalize(data);
        return response;
    },
    (error) => {
        if (error.code === 'ECONNREFUSED' || !error.response) {
            console.warn('[API] Backend unavailable – running in offline mode');
        }
        return Promise.reject(error);
    }
);

// ── Named endpoint helpers ────────────────────────────────────────────────────
export const contactsApi        = buildCrud('contacts');
export const opportunitiesApi   = buildCrud('opportunities');
export const customersApi       = buildCrud('customers');
export const companiesApi       = buildCrud('companies');
export const groupsApi          = buildCrud('groups');
export const activitiesApi      = buildCrud('activities');
export const notesApi           = buildCrud('notes');
export const historyApi         = buildCrud('history');
export const documentsApi       = buildCrud('documents');
export const secondaryContactsApi = buildCrud('secondary-contacts');
export const invoicesApi        = buildCrud('invoices');
export const tasksApi           = buildCrud('tasks');
export const boardsApi          = buildCrud('boards');
export const equipmentApi       = buildCrud('equipment');
export const stockLocationsApi  = buildCrud('stock-locations');
export const crewMembersApi     = buildCrud('crew-members');
export const vehiclesApi        = buildCrud('vehicles');
export const maintenanceApi     = buildCrud('maintenance');
export const requestsApi        = buildCrud('requests');

// Pipeline & permissions stored as key/value settings
export const settingsApi = {
    get: (key) => api.get(`/settings/${key}`),
    set: (key, value) => api.put(`/settings/${key}`, value),
};

function buildCrud(resource) {
    return {
        getAll: ()          => api.get(`/${resource}`),
        getOne: (id)        => api.get(`/${resource}/${id}`),
        create: (data)      => api.post(`/${resource}`, data),
        update: (id, data)  => api.put(`/${resource}/${id}`, data),
        remove: (id)        => api.delete(`/${resource}/${id}`),
    };
}

export default api;
