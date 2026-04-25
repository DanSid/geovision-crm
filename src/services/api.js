/**
 * api.js — Supabase-backed data layer
 *
 * Every CRM table uses the shape: { id UUID PK, data JSONB, created_at, updated_at }
 * The "data" column stores all entity fields as a JSON blob so the schema never
 * needs to change when new fields are added to the frontend.
 *
 * The normalize() helper flattens a row back into the shape Redux expects,
 * keeping the same interface the rest of the codebase used with the old axios layer.
 */
import { supabase } from './supabase';

/* ── Flatten a Supabase JSONB row → Redux-friendly object ────────────────── */
const normalize = (row) => {
    if (!row) return null;
    const { id, data, created_at, updated_at } = row;
    return {
        ...(data || {}),
        id:        String(id),
        _id:       String(id),          // legacy alias used throughout the codebase
        createdAt: (data && data.createdAt) || created_at || null,
        updatedAt: (data && data.updatedAt) || updated_at || null,
    };
};

/* ── Generic CRUD factory (same external interface as old axios buildCrud) ── */
function buildCrud(table) {
    return {
        /* List all rows, newest first */
        getAll: async () => {
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw new Error(`[${table}] getAll: ${error.message}`);
            return { data: (data || []).map(normalize) };
        },

        /* Single row by UUID */
        getOne: async (id) => {
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .eq('id', String(id))
                .single();
            if (error) throw new Error(`[${table}] getOne: ${error.message}`);
            return { data: normalize(data) };
        },

        /* INSERT — strip any client-side id so Supabase generates the UUID */
        create: async (item) => {
            // eslint-disable-next-line no-unused-vars
            const { id, _id, createdAt, updatedAt, ...rest } = item || {};
            const { data, error } = await supabase
                .from(table)
                .insert({ data: rest })
                .select()
                .single();
            if (error) throw new Error(`[${table}] create: ${error.message}`);
            return { data: normalize(data) };
        },

        /* UPDATE — replace the data blob for the given UUID */
        update: async (id, item) => {
            // eslint-disable-next-line no-unused-vars
            const { id: _a, _id: _b, ...rest } = item || {};
            const { data, error } = await supabase
                .from(table)
                .update({ data: rest, updated_at: new Date().toISOString() })
                .eq('id', String(id))
                .select()
                .single();
            if (error) throw new Error(`[${table}] update: ${error.message}`);
            return { data: normalize(data) };
        },

        /* DELETE by UUID */
        remove: async (id) => {
            const { error } = await supabase
                .from(table)
                .delete()
                .eq('id', String(id));
            if (error) throw new Error(`[${table}] remove: ${error.message}`);
            return { data: null };
        },
    };
}

/* ── Named endpoint helpers ──────────────────────────────────────────────── */
export const contactsApi          = buildCrud('contacts');
export const opportunitiesApi     = buildCrud('opportunities');
export const customersApi         = buildCrud('customers');
export const companiesApi         = buildCrud('companies');
export const groupsApi            = buildCrud('groups');
export const activitiesApi        = buildCrud('activities');
export const notesApi             = buildCrud('notes');
export const historyApi           = buildCrud('history');
export const documentsApi         = buildCrud('documents');
export const secondaryContactsApi = buildCrud('secondary_contacts');
export const invoicesApi          = buildCrud('invoices');
export const tasksApi             = buildCrud('tasks');
export const boardsApi            = buildCrud('boards');
export const equipmentApi         = buildCrud('equipment');
export const stockLocationsApi    = buildCrud('stock_locations');
export const crewMembersApi       = buildCrud('crew_members');
export const vehiclesApi          = buildCrud('vehicles');
export const maintenanceApi       = buildCrud('maintenance');
export const requestsApi          = buildCrud('requests');

/* ── Cascade helper: delete all rows where data->>'entityId' = entityId ─── */
export const deleteByEntityId = async (table, entityId) => {
    if (!entityId) return;
    const { error } = await supabase
        .from(table)
        .delete()
        .filter('data->>entityId', 'eq', String(entityId));
    if (error) console.warn(`[${table}] deleteByEntityId(${entityId}):`, error.message);
};

/* ── Settings: single JSONB document per string key ─────────────────────── */
export const settingsApi = {
    get: async (key) => {
        const { data, error } = await supabase
            .from('settings')
            .select('value')
            .eq('key', key)
            .maybeSingle();
        if (error) throw new Error(`[settings] get(${key}): ${error.message}`);
        return { data: data?.value ?? null };
    },
    set: async (key, value) => {
        const { data, error } = await supabase
            .from('settings')
            .upsert({ key, value }, { onConflict: 'key' })
            .select()
            .single();
        if (error) throw new Error(`[settings] set(${key}): ${error.message}`);
        return { data };
    },
};

export default supabase;
