import { applyMiddleware, compose, createStore } from "redux";
import reducers from "../reducer";
import { subscribeToRealtime } from "../../services/realtime";

const thunk = store => next => action => {
    if (typeof action === 'function') {
        return action(store.dispatch, store.getState);
    }
    return next(action);
};

// --- localStorage helpers ---
const safeLoad = (key, isArray = true) => {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return isArray ? [] : null;
        const parsed = JSON.parse(raw);
        if (isArray) return Array.isArray(parsed) ? parsed : [];
        return parsed;
    } catch { return isArray ? [] : null; }
};

const safeSave = (key, data) => {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* ignore */ }
};

// Load all CRM slices from localStorage as preloadedState
const loadCrmPreloadedState = () => {
    const permissions = safeLoad('gv_crm_permissions', false);
    const pipeline = safeLoad('gv_crm_pipeline', false);
    return {
        tasks:            safeLoad('gv_crm_tasks'),
        contacts:         safeLoad('gv_crm_contacts'),
        opportunities:    safeLoad('gv_crm_opportunities'),
        customers:        safeLoad('gv_crm_customers'),
        boards:           safeLoad('gv_crm_boards'),
        companies:        safeLoad('gv_crm_companies'),
        groups:           safeLoad('gv_crm_groups'),
        activities:       safeLoad('gv_crm_activities'),
        notes:            safeLoad('gv_crm_notes'),
        history:          safeLoad('gv_crm_history'),
        documents:        safeLoad('gv_crm_documents'),
        secondaryContacts: safeLoad('gv_crm_secondary_contacts'),
        invoices:         safeLoad('gv_crm_invoices'),
        equipment:        safeLoad('gv_crm_equipment'),
        stockLocations:   safeLoad('gv_crm_stock_locations'),
        crewMembers:      safeLoad('gv_crm_crew_members'),
        vehicles:         safeLoad('gv_crm_vehicles'),
        maintenance:      safeLoad('gv_crm_maintenance'),
        requests:         safeLoad('gv_crm_requests'),
        ...(permissions ? { permissions } : {}),
        ...(pipeline !== null ? { pipeline } : {}),
    };
};

// Save all CRM slices back to localStorage on every state change
const saveCrmState = (state) => {
    safeSave('gv_crm_tasks',              state.tasks);
    safeSave('gv_crm_contacts',           state.contacts);
    safeSave('gv_crm_opportunities',      state.opportunities);
    safeSave('gv_crm_customers',          state.customers);
    safeSave('gv_crm_boards',             state.boards);
    safeSave('gv_crm_companies',          state.companies);
    safeSave('gv_crm_groups',             state.groups);
    safeSave('gv_crm_activities',         state.activities);
    safeSave('gv_crm_notes',              state.notes);
    safeSave('gv_crm_history',            state.history);
    safeSave('gv_crm_documents',          state.documents);
    safeSave('gv_crm_secondary_contacts', state.secondaryContacts);
    safeSave('gv_crm_invoices',           state.invoices);
    safeSave('gv_crm_equipment',          state.equipment);
    safeSave('gv_crm_stock_locations',    state.stockLocations);
    safeSave('gv_crm_crew_members',       state.crewMembers);
    safeSave('gv_crm_vehicles',           state.vehicles);
    safeSave('gv_crm_maintenance',        state.maintenance);
    safeSave('gv_crm_requests',           state.requests);
    if (state.permissions) safeSave('gv_crm_permissions', state.permissions);
    if (state.pipeline !== undefined) safeSave('gv_crm_pipeline', state.pipeline);
};

const configureStore = (preloadedState) => {
    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
    const store = createStore(reducers, preloadedState, composeEnhancers(applyMiddleware(thunk)));
    return store;
};

const store = configureStore(loadCrmPreloadedState());

// Mirror every Redux change to localStorage (offline fallback)
store.subscribe(() => saveCrmState(store.getState()));

// Start Supabase real-time — push remote changes into Redux immediately
subscribeToRealtime(store);

export default store;
