import {
    ADD_CONTACT, UPDATE_CONTACT, DELETE_CONTACT, INIT_CONTACTS,
    ADD_OPPORTUNITY, UPDATE_OPPORTUNITY, DELETE_OPPORTUNITY, INIT_OPPORTUNITIES,
    ADD_CUSTOMER, UPDATE_CUSTOMER, DELETE_CUSTOMER, INIT_CUSTOMERS,
    ADD_TASK, UPDATE_TASK, DELETE_TASK, TOGGLE_TASK, INIT_TASKS,
    SET_PERMISSION, RESET_PERMISSIONS, INIT_PERMISSIONS, APPLY_USER_PERMISSIONS,
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

import {
    contactsApi, opportunitiesApi, customersApi, companiesApi, groupsApi,
    activitiesApi, notesApi, historyApi, documentsApi, secondaryContactsApi,
    invoicesApi, tasksApi, boardsApi, equipmentApi, stockLocationsApi,
    crewMembersApi, vehiclesApi, maintenanceApi, requestsApi, settingsApi,
} from '../../services/api';
import { isActivityDueNow } from '../../utils/activitySchedule';

// ── Generic CRUD thunk factory ────────────────────────────────────────────────
// Creates add/update/delete thunks for any entity.
// Falls back to local-only dispatch when the backend is unreachable.

const makeLocal = (data, extra = {}) => ({
    ...data,
    ...extra,
    id: data.id || String(Date.now()),
    createdAt: data.createdAt || new Date().toISOString(),
});

const crudThunks = (apiService, ADD, UPDATE, DELETE) => ({
    add: (data) => async (dispatch) => {
        try {
            const { data: saved } = await apiService.create(data);
            dispatch({ type: ADD, payload: saved });
            return saved;
        } catch {
            const local = makeLocal(data);
            dispatch({ type: ADD, payload: local });
            return local;
        }
    },
    update: (data) => async (dispatch) => {
        try {
            const { data: saved } = await apiService.update(data.id, data);
            dispatch({ type: UPDATE, payload: saved });
        } catch {
            dispatch({ type: UPDATE, payload: data });
        }
    },
    remove: (id) => async (dispatch) => {
        try {
            await apiService.remove(id);
        } catch { /* still remove locally */ }
        dispatch({ type: DELETE, payload: id });
    },
});

// ── CONTACTS ─────────────────────────────────────────────────────────────────
const contactCrud = crudThunks(contactsApi, ADD_CONTACT, UPDATE_CONTACT, DELETE_CONTACT);
export const addContact    = contactCrud.add;
export const updateContact = contactCrud.update;
export const deleteContact = contactCrud.remove;

// ── OPPORTUNITIES ─────────────────────────────────────────────────────────────
const oppCrud = crudThunks(opportunitiesApi, ADD_OPPORTUNITY, UPDATE_OPPORTUNITY, DELETE_OPPORTUNITY);
export const addOpportunity    = oppCrud.add;
export const updateOpportunity = oppCrud.update;
export const deleteOpportunity = oppCrud.remove;

// ── CUSTOMERS ─────────────────────────────────────────────────────────────────
const customerCrud = crudThunks(customersApi, ADD_CUSTOMER, UPDATE_CUSTOMER, DELETE_CUSTOMER);
export const addCustomer    = customerCrud.add;
export const updateCustomer = customerCrud.update;
export const deleteCustomer = customerCrud.remove;

// ── TASKS ─────────────────────────────────────────────────────────────────────
const taskCrud = crudThunks(tasksApi, ADD_TASK, UPDATE_TASK, DELETE_TASK);
export const addTask    = taskCrud.add;
export const updateTask = taskCrud.update;
export const deleteTask = taskCrud.remove;
export const toggleTask = (id) => async (dispatch, getState) => {
    const task = getState().tasks.find((t) => t.id === id);
    if (!task) return;
    const updated = { ...task, done: !task.done };
    try {
        const { data: saved } = await tasksApi.update(id, updated);
        dispatch({ type: UPDATE_TASK, payload: saved });
    } catch {
        dispatch({ type: TOGGLE_TASK, payload: id });
    }
};

// ── PERMISSIONS ───────────────────────────────────────────────────────────────
export const setPermission = (key, value) => async (dispatch, getState) => {
    const next = { ...getState().permissions, [key]: value };
    dispatch({ type: SET_PERMISSION, payload: { key, value } });
    try { await settingsApi.set('permissions', next); } catch { /* offline */ }
};
export const resetPermissions = () => async (dispatch) => {
    dispatch({ type: RESET_PERMISSIONS });
    try { await settingsApi.set('permissions', null); } catch { /* offline */ }
};

/**
 * saveUserPermissionsAction — called by admin when saving per-user permissions.
 * Saves to BOTH Supabase settings table AND Redux/localStorage so the change
 * is visible on every device immediately.
 */
export const saveUserPermissionsAction = (userId, perms) => async (dispatch) => {
    // Update Redux state immediately (triggers Sidebar re-render for all connected components)
    dispatch({ type: APPLY_USER_PERMISSIONS, payload: { userId, perms } });
    // Persist to Supabase so any device can retrieve it on next login
    try { await settingsApi.set(`user_perms_${userId}`, perms); } catch { /* offline */ }
};

/**
 * fetchUserPermissions — called after login to pull per-user permissions from
 * Supabase into Redux. This makes restrictions work on every device/browser.
 */
export const fetchUserPermissions = (userId) => async (dispatch) => {
    if (!userId) return;
    try {
        const result = await settingsApi.get(`user_perms_${userId}`);
        if (result?.data) {
            dispatch({ type: APPLY_USER_PERMISSIONS, payload: { userId, perms: result.data } });
        }
    } catch { /* ignore — falls back to global permissions */ }
};

// ── BOARDS ────────────────────────────────────────────────────────────────────
const boardCrud = crudThunks(boardsApi, ADD_BOARD, UPDATE_BOARD, DELETE_BOARD);
export const addBoard    = boardCrud.add;
export const updateBoard = boardCrud.update;
export const deleteBoard = boardCrud.remove;

// ── PIPELINE ──────────────────────────────────────────────────────────────────
export const setPipeline = (data) => async (dispatch) => {
    dispatch({ type: SET_PIPELINE, payload: data });
    try { await settingsApi.set('pipeline', data); } catch { /* offline */ }
};

// ── COMPANIES ─────────────────────────────────────────────────────────────────
const companyCrud = crudThunks(companiesApi, ADD_COMPANY, UPDATE_COMPANY, DELETE_COMPANY);
export const addCompany    = companyCrud.add;
export const updateCompany = companyCrud.update;
export const deleteCompany = companyCrud.remove;

// ── GROUPS ────────────────────────────────────────────────────────────────────
const groupCrud = crudThunks(groupsApi, ADD_GROUP, UPDATE_GROUP, DELETE_GROUP);
export const addGroup    = groupCrud.add;
export const updateGroup = groupCrud.update;
export const deleteGroup = groupCrud.remove;

// ── ACTIVITIES ────────────────────────────────────────────────────────────────

/**
 * Fire the 'gv-activity-due' custom DOM event if the activity's scheduled
 * time has arrived (within the last 90 minutes).  The Navbar listens for
 * this event and shows the alert modal immediately — bypassing the 60-second
 * polling cycle entirely.
 */
const fireIfDue = (activity) => {
    if (!activity || activity.completed) return;
    if (!['Meeting', 'Call', 'Email', 'To-Do'].includes(activity.type)) return;
    if (isActivityDueNow(activity)) {
        window.dispatchEvent(new CustomEvent('gv-activity-due', { detail: activity }));
    }
};

const activityCrudInternal = crudThunks(activitiesApi, ADD_ACTIVITY, UPDATE_ACTIVITY, DELETE_ACTIVITY);

export const addActivity = (data) => async (dispatch) => {
    const saved = await activityCrudInternal.add(data)(dispatch);
    fireIfDue(saved);
    return saved;
};

export const updateActivity = (data) => async (dispatch) => {
    await activityCrudInternal.update(data)(dispatch);
    fireIfDue(data);
};

export const deleteActivity = activityCrudInternal.remove;

// ── NOTES ─────────────────────────────────────────────────────────────────────
export const addNote = (data) => async (dispatch) => {
    try {
        const { data: saved } = await notesApi.create(data);
        dispatch({ type: ADD_NOTE, payload: saved });
    } catch {
        dispatch({ type: ADD_NOTE, payload: makeLocal(data) });
    }
};
export const deleteNote = (id) => async (dispatch) => {
    try { await notesApi.remove(id); } catch { /* offline */ }
    dispatch({ type: DELETE_NOTE, payload: id });
};

// ── HISTORY ───────────────────────────────────────────────────────────────────
export const addHistoryEntry = (entry) => async (dispatch) => {
    try {
        const { data: saved } = await historyApi.create(entry);
        dispatch({ type: ADD_HISTORY_ENTRY, payload: saved });
    } catch {
        dispatch({ type: ADD_HISTORY_ENTRY, payload: makeLocal(entry) });
    }
};

// ── DOCUMENTS ─────────────────────────────────────────────────────────────────
export const addDocument = (doc) => async (dispatch) => {
    try {
        const { data: saved } = await documentsApi.create(doc);
        dispatch({ type: ADD_DOCUMENT, payload: saved });
    } catch {
        dispatch({ type: ADD_DOCUMENT, payload: { ...makeLocal(doc), uploadedAt: new Date().toISOString() } });
    }
};
export const deleteDocument = (id) => async (dispatch) => {
    try { await documentsApi.remove(id); } catch { /* offline */ }
    dispatch({ type: DELETE_DOCUMENT, payload: id });
};

// ── SECONDARY CONTACTS ────────────────────────────────────────────────────────
const scCrud = crudThunks(secondaryContactsApi, ADD_SECONDARY_CONTACT, UPDATE_SECONDARY_CONTACT, DELETE_SECONDARY_CONTACT);
export const addSecondaryContact    = scCrud.add;
export const updateSecondaryContact = scCrud.update;
export const deleteSecondaryContact = scCrud.remove;

// ── INVOICES ──────────────────────────────────────────────────────────────────
const invoiceCrud = crudThunks(invoicesApi, ADD_INVOICE, UPDATE_INVOICE, DELETE_INVOICE);
export const addInvoice    = invoiceCrud.add;
export const updateInvoice = invoiceCrud.update;
export const deleteInvoice = invoiceCrud.remove;

// ── EQUIPMENT ─────────────────────────────────────────────────────────────────
const equipCrud = crudThunks(equipmentApi, ADD_EQUIPMENT, UPDATE_EQUIPMENT, DELETE_EQUIPMENT);
export const addEquipment    = equipCrud.add;
export const updateEquipment = equipCrud.update;
export const deleteEquipment = equipCrud.remove;

// ── STOCK LOCATIONS ───────────────────────────────────────────────────────────
const slCrud = crudThunks(stockLocationsApi, ADD_STOCK_LOCATION, UPDATE_STOCK_LOCATION, DELETE_STOCK_LOCATION);
export const addStockLocation    = slCrud.add;
export const updateStockLocation = slCrud.update;
export const deleteStockLocation = slCrud.remove;

// ── CREW MEMBERS ──────────────────────────────────────────────────────────────
const cmCrud = crudThunks(crewMembersApi, ADD_CREW_MEMBER, UPDATE_CREW_MEMBER, DELETE_CREW_MEMBER);
export const addCrewMember    = cmCrud.add;
export const updateCrewMember = cmCrud.update;
export const deleteCrewMember = cmCrud.remove;

// ── VEHICLES ──────────────────────────────────────────────────────────────────
const vehicleCrud = crudThunks(vehiclesApi, ADD_VEHICLE, UPDATE_VEHICLE, DELETE_VEHICLE);
export const addVehicle    = vehicleCrud.add;
export const updateVehicle = vehicleCrud.update;
export const deleteVehicle = vehicleCrud.remove;

// ── MAINTENANCE ───────────────────────────────────────────────────────────────
const maintCrud = crudThunks(maintenanceApi, ADD_MAINTENANCE, UPDATE_MAINTENANCE, DELETE_MAINTENANCE);
export const addMaintenance    = maintCrud.add;
export const updateMaintenance = maintCrud.update;
export const deleteMaintenance = maintCrud.remove;

// ── REQUESTS ──────────────────────────────────────────────────────────────────
const reqCrud = crudThunks(requestsApi, ADD_REQUEST, UPDATE_REQUEST, DELETE_REQUEST);
export const addRequest    = reqCrud.add;
export const updateRequest = reqCrud.update;
export const deleteRequest = reqCrud.remove;

// ═════════════════════════════════════════════════════════════════════════════
// APP INITIALIZER — fetch all data from MongoDB on startup
// ═════════════════════════════════════════════════════════════════════════════
export const initApp = () => async (dispatch) => {
    const tryGet = async (apiFn) => {
        try { return (await apiFn()).data; } catch { return null; }
    };

    const [
        contacts, opportunities, customers, companies, groups,
        activities, notes, history, documents, secondaryContacts,
        invoices, tasks, boards, equipment, stockLocations,
        crewMembers, vehicles, maintenance, requests,
        pipeline, permissions,
    ] = await Promise.all([
        tryGet(contactsApi.getAll),
        tryGet(opportunitiesApi.getAll),
        tryGet(customersApi.getAll),
        tryGet(companiesApi.getAll),
        tryGet(groupsApi.getAll),
        tryGet(activitiesApi.getAll),
        tryGet(notesApi.getAll),
        tryGet(historyApi.getAll),
        tryGet(documentsApi.getAll),
        tryGet(secondaryContactsApi.getAll),
        tryGet(invoicesApi.getAll),
        tryGet(tasksApi.getAll),
        tryGet(boardsApi.getAll),
        tryGet(equipmentApi.getAll),
        tryGet(stockLocationsApi.getAll),
        tryGet(crewMembersApi.getAll),
        tryGet(vehiclesApi.getAll),
        tryGet(maintenanceApi.getAll),
        tryGet(requestsApi.getAll),
        tryGet(() => settingsApi.get('pipeline')),
        tryGet(() => settingsApi.get('permissions')),
    ]);

    if (contacts)          dispatch({ type: INIT_CONTACTS,          payload: contacts });
    if (opportunities)     dispatch({ type: INIT_OPPORTUNITIES,     payload: opportunities });
    if (customers)         dispatch({ type: INIT_CUSTOMERS,         payload: customers });
    if (companies)         dispatch({ type: INIT_COMPANIES,         payload: companies });
    if (groups)            dispatch({ type: INIT_GROUPS,            payload: groups });
    if (activities)        dispatch({ type: INIT_ACTIVITIES,        payload: activities });
    if (notes)             dispatch({ type: INIT_NOTES,             payload: notes });
    if (history)           dispatch({ type: INIT_HISTORY,           payload: history });
    if (documents)         dispatch({ type: INIT_DOCUMENTS,         payload: documents });
    if (secondaryContacts) dispatch({ type: INIT_SECONDARY_CONTACTS,payload: secondaryContacts });
    if (invoices)          dispatch({ type: INIT_INVOICES,          payload: invoices });
    if (tasks)             dispatch({ type: INIT_TASKS,             payload: tasks });
    if (boards)            dispatch({ type: INIT_BOARDS,            payload: boards });
    if (equipment)         dispatch({ type: INIT_EQUIPMENT,         payload: equipment });
    if (stockLocations)    dispatch({ type: INIT_STOCK_LOCATIONS,   payload: stockLocations });
    if (crewMembers)       dispatch({ type: INIT_CREW_MEMBERS,      payload: crewMembers });
    if (vehicles)          dispatch({ type: INIT_VEHICLES,          payload: vehicles });
    if (maintenance)       dispatch({ type: INIT_MAINTENANCE,       payload: maintenance });
    if (requests)          dispatch({ type: INIT_REQUESTS,          payload: requests });
    if (pipeline)          dispatch({ type: INIT_PIPELINE,          payload: pipeline });
    if (permissions)       dispatch({ type: INIT_PERMISSIONS,       payload: permissions });
};

// ═════════════════════════════════════════════════════════════════════════════
// THUNK HELPERS (with history logging)
// ═════════════════════════════════════════════════════════════════════════════

export const addContactWithHistory = (contactData) => async (dispatch) => {
    const saved = await dispatch(addContact(contactData));
    dispatch(addHistoryEntry({
        entityType: 'contact', entityId: saved?.id,
        action: 'created',
        description: `Contact "${(saved?.firstName || '') + ' ' + (saved?.lastName || '')}".trim() created`,
    }));
};

export const updateContactWithHistory = (contact) => async (dispatch) => {
    await dispatch(updateContact(contact));
    dispatch(addHistoryEntry({
        entityType: 'contact', entityId: contact.id,
        action: 'updated',
        description: `Contact "${(contact.firstName || '') + ' ' + (contact.lastName || '')}".trim() updated`,
    }));
};

export const addOpportunityWithHistory = (oppData, entityType, entityId) => async (dispatch) => {
    const saved = await dispatch(addOpportunity(oppData));
    if (entityType && entityId) {
        dispatch(addHistoryEntry({
            entityType, entityId,
            action: 'opportunity_added',
            description: `Opportunity "${saved?.name}" (${saved?.stage}) linked`,
        }));
    }
};

export const addActivityWithHistory = (activityData) => async (dispatch) => {
    const saved = await dispatch(addActivity(activityData));
    dispatch(addHistoryEntry({
        entityType: activityData.entityType,
        entityId: activityData.entityId,
        action: 'activity_added',
        description: `Activity "${saved?.title}" (${activityData.type}) scheduled`,
    }));
};

export const addNoteWithHistory = (noteData) => async (dispatch) => {
    await dispatch(addNote(noteData));
    dispatch(addHistoryEntry({
        entityType: noteData.entityType,
        entityId: noteData.entityId,
        action: 'note_added',
        description: 'Note added',
    }));
};
