/**
 * realtime.js — Supabase real-time subscriptions wired into Redux.
 *
 * When any user on any browser inserts, updates, or deletes a CRM record,
 * Supabase pushes the change over WebSocket and we dispatch the matching
 * Redux action so all connected clients see it immediately — no polling, no
 * page refresh.
 *
 * Call subscribeToRealtime(store) once after the Redux store is created.
 */
import { supabase } from './supabase';
import {
    ADD_CONTACT,    UPDATE_CONTACT,    DELETE_CONTACT,
    ADD_OPPORTUNITY,UPDATE_OPPORTUNITY,DELETE_OPPORTUNITY,
    ADD_CUSTOMER,   UPDATE_CUSTOMER,   DELETE_CUSTOMER,
    ADD_TASK,       UPDATE_TASK,       DELETE_TASK,
    ADD_COMPANY,    UPDATE_COMPANY,    DELETE_COMPANY,
    ADD_GROUP,      UPDATE_GROUP,      DELETE_GROUP,
    ADD_ACTIVITY,   UPDATE_ACTIVITY,   DELETE_ACTIVITY,
    ADD_NOTE,                          DELETE_NOTE,
    ADD_HISTORY_ENTRY,
    ADD_DOCUMENT,                      DELETE_DOCUMENT,
    ADD_SECONDARY_CONTACT, UPDATE_SECONDARY_CONTACT, DELETE_SECONDARY_CONTACT,
    ADD_INVOICE,    UPDATE_INVOICE,    DELETE_INVOICE,
    ADD_BOARD,      UPDATE_BOARD,      DELETE_BOARD,
    ADD_EQUIPMENT,  UPDATE_EQUIPMENT,  DELETE_EQUIPMENT,
    ADD_STOCK_LOCATION,  UPDATE_STOCK_LOCATION,  DELETE_STOCK_LOCATION,
    ADD_CREW_MEMBER,     UPDATE_CREW_MEMBER,     DELETE_CREW_MEMBER,
    ADD_VEHICLE,    UPDATE_VEHICLE,    DELETE_VEHICLE,
    ADD_MAINTENANCE,UPDATE_MAINTENANCE,DELETE_MAINTENANCE,
    ADD_REQUEST,    UPDATE_REQUEST,    DELETE_REQUEST,
} from '../redux/constants/Crm';

/* ── Same flatten as api.js ───────────────────────────────────────────────── */
const normalize = (row) => {
    if (!row) return null;
    const { id, data, created_at, updated_at } = row;
    return {
        ...(data || {}),
        id:        String(id),
        _id:       String(id),
        createdAt: (data && data.createdAt) || created_at || null,
        updatedAt: (data && data.updatedAt) || updated_at || null,
    };
};

/* ── Table → Redux action map ─────────────────────────────────────────────── */
const TABLE_MAP = [
    { table: 'contacts',           add: ADD_CONTACT,           upd: UPDATE_CONTACT,           del: DELETE_CONTACT           },
    { table: 'opportunities',      add: ADD_OPPORTUNITY,       upd: UPDATE_OPPORTUNITY,       del: DELETE_OPPORTUNITY       },
    { table: 'customers',          add: ADD_CUSTOMER,          upd: UPDATE_CUSTOMER,          del: DELETE_CUSTOMER          },
    { table: 'tasks',              add: ADD_TASK,              upd: UPDATE_TASK,              del: DELETE_TASK              },
    { table: 'companies',          add: ADD_COMPANY,           upd: UPDATE_COMPANY,           del: DELETE_COMPANY           },
    { table: 'groups',             add: ADD_GROUP,             upd: UPDATE_GROUP,             del: DELETE_GROUP             },
    { table: 'activities',         add: ADD_ACTIVITY,          upd: UPDATE_ACTIVITY,          del: DELETE_ACTIVITY          },
    { table: 'notes',              add: ADD_NOTE,              upd: null,                     del: DELETE_NOTE              },
    { table: 'history',            add: ADD_HISTORY_ENTRY,     upd: null,                     del: null                     },
    { table: 'documents',          add: ADD_DOCUMENT,          upd: null,                     del: DELETE_DOCUMENT          },
    { table: 'secondary_contacts', add: ADD_SECONDARY_CONTACT, upd: UPDATE_SECONDARY_CONTACT, del: DELETE_SECONDARY_CONTACT },
    { table: 'invoices',           add: ADD_INVOICE,           upd: UPDATE_INVOICE,           del: DELETE_INVOICE           },
    { table: 'boards',             add: ADD_BOARD,             upd: UPDATE_BOARD,             del: DELETE_BOARD             },
    { table: 'equipment',          add: ADD_EQUIPMENT,         upd: UPDATE_EQUIPMENT,         del: DELETE_EQUIPMENT         },
    { table: 'stock_locations',    add: ADD_STOCK_LOCATION,    upd: UPDATE_STOCK_LOCATION,    del: DELETE_STOCK_LOCATION    },
    { table: 'crew_members',       add: ADD_CREW_MEMBER,       upd: UPDATE_CREW_MEMBER,       del: DELETE_CREW_MEMBER       },
    { table: 'vehicles',           add: ADD_VEHICLE,           upd: UPDATE_VEHICLE,           del: DELETE_VEHICLE           },
    { table: 'maintenance',        add: ADD_MAINTENANCE,       upd: UPDATE_MAINTENANCE,       del: DELETE_MAINTENANCE       },
    { table: 'requests',           add: ADD_REQUEST,           upd: UPDATE_REQUEST,           del: DELETE_REQUEST           },
];

/* ═══════════════════════════════════════════════════════════════════════════
   subscribeToRealtime(store)
   Call once after store creation. Returns an unsubscribe function.
═══════════════════════════════════════════════════════════════════════════ */
export const subscribeToRealtime = (store) => {
    const channel = supabase.channel('crm-all-tables');

    TABLE_MAP.forEach(({ table, add, upd, del }) => {
        channel.on(
            'postgres_changes',
            { event: '*', schema: 'public', table },
            (payload) => {
                const { eventType, new: newRow, old: oldRow } = payload;

                if (eventType === 'INSERT' && add) {
                    store.dispatch({ type: add, payload: normalize(newRow) });
                } else if (eventType === 'UPDATE' && upd) {
                    store.dispatch({ type: upd, payload: normalize(newRow) });
                } else if (eventType === 'DELETE' && del) {
                    // Only the PK is guaranteed in oldRow for DELETE
                    store.dispatch({ type: del, payload: String(oldRow?.id || '') });
                }
            }
        );
    });

    channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
            console.log('⚡ Supabase real-time connected — live updates active');
        } else if (status === 'CHANNEL_ERROR') {
            console.warn('⚠️  Supabase real-time channel error — retrying...');
        }
    });

    // Return a cleanup function
    return () => supabase.removeChannel(channel);
};
