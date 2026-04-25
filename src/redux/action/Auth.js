/**
 * Auth.js — Supabase Auth-backed authentication actions.
 *
 * Supabase Auth stores credentials server-side (bcrypt-hashed).
 * Custom fields (name, username, role, photo) live in user_metadata.
 *
 * Redux currentUser shape stays unchanged:
 *   { id, name, username, email, role, photo }
 */
import { supabase } from '../../services/supabase';
import {
    AUTH_ERROR, CLEAR_AUTH_ERROR,
    LOGIN_SUCCESS, LOGOUT, REGISTER_SUCCESS, UPDATE_PROFILE,
} from '../constants/Auth';

/* ── localStorage keys (session persistence / bootstrap) ─────────────────── */
const CURRENT_USER_KEYS = ['gv_crm_current_user', 'crm_current_user', 'currentUser', 'auth_user'];

const persistCurrentUser = (user) =>
    CURRENT_USER_KEYS.forEach((k) => {
        try { localStorage.setItem(k, JSON.stringify(user)); } catch { /* ignore */ }
    });

const clearCurrentUser = () =>
    CURRENT_USER_KEYS.forEach((k) => {
        try { localStorage.removeItem(k); } catch { /* ignore */ }
    });

/* ── Supabase User → Redux currentUser ───────────────────────────────────── */
const toReduxUser = (supaUser) => {
    if (!supaUser) return null;
    const m = supaUser.user_metadata || {};
    return {
        id:       supaUser.id,
        name:     m.name     || m.full_name || supaUser.email?.split('@')[0] || 'User',
        username: m.username || supaUser.email?.split('@')[0] || 'user',
        email:    supaUser.email || '',
        role:     m.role    || 'user',
        photo:    m.photo   || m.avatar_url || '',
    };
};

/* ═══════════════════════════════════════════════════════════════════════════
   loadCurrentUser — synchronous bootstrap used by the Auth reducer.
   Reads from localStorage; the Supabase async session corrects it via
   syncSupabaseSession() dispatched from App.jsx on mount.
═══════════════════════════════════════════════════════════════════════════ */
export const loadCurrentUser = () => {
    for (const key of CURRENT_USER_KEYS) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) continue;
            const parsed = JSON.parse(raw);
            if (parsed && (parsed.email || parsed.username)) {
                const { password, ...safeUser } = parsed; // eslint-disable-line no-unused-vars
                return safeUser;
            }
        } catch { /* ignore */ }
    }
    return null;
};

/* ═══════════════════════════════════════════════════════════════════════════
   syncSupabaseSession — call on app mount to pick up an existing session
   (e.g. after a page refresh) and keep Redux in sync.
═══════════════════════════════════════════════════════════════════════════ */
export const syncSupabaseSession = () => async (dispatch) => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            const user = toReduxUser(session.user);
            persistCurrentUser(user);
            dispatch({ type: LOGIN_SUCCESS, payload: user });
        }
    } catch { /* ignore — localStorage bootstrap is the fallback */ }
};

/* ═══════════════════════════════════════════════════════════════════════════
   loginUser
═══════════════════════════════════════════════════════════════════════════ */
export const loginUser = (email, password) => async (dispatch) => {
    dispatch({ type: CLEAR_AUTH_ERROR });
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email:    String(email || '').trim().toLowerCase(),
            password: String(password || ''),
        });

        if (error) {
            dispatch({ type: AUTH_ERROR, payload: 'Invalid email/username or password.' });
            return false;
        }

        const user = toReduxUser(data.user);
        persistCurrentUser(user);
        dispatch({ type: LOGIN_SUCCESS, payload: user });
        return true;
    } catch {
        dispatch({ type: AUTH_ERROR, payload: 'Login failed. Please try again.' });
        return false;
    }
};

/* ═══════════════════════════════════════════════════════════════════════════
   registerUser
═══════════════════════════════════════════════════════════════════════════ */
export const registerUser = (userData) => async (dispatch) => {
    dispatch({ type: CLEAR_AUTH_ERROR });
    try {
        const { data, error } = await supabase.auth.signUp({
            email:    String(userData.email || '').trim().toLowerCase(),
            password: String(userData.password || ''),
            options: {
                data: {
                    name:     String(userData.name     || '').trim(),
                    username: String(userData.username || '').trim(),
                    role:     'user',
                },
            },
        });

        if (error) {
            dispatch({ type: AUTH_ERROR, payload: error.message });
            return false;
        }

        // Empty identities = email already registered (Supabase quirk)
        if (data.user?.identities?.length === 0) {
            dispatch({ type: AUTH_ERROR, payload: 'An account with this email already exists.' });
            return false;
        }

        const user = toReduxUser(data.user);
        persistCurrentUser(user);
        dispatch({ type: REGISTER_SUCCESS, payload: user });
        return true;
    } catch {
        dispatch({ type: AUTH_ERROR, payload: 'Registration failed. Please try again.' });
        return false;
    }
};

/* ═══════════════════════════════════════════════════════════════════════════
   logoutUser
═══════════════════════════════════════════════════════════════════════════ */
export const logoutUser = () => async (dispatch) => {
    await supabase.auth.signOut().catch(() => {});
    clearCurrentUser();
    dispatch({ type: LOGOUT });
};

/* ═══════════════════════════════════════════════════════════════════════════
   updateCurrentUser
═══════════════════════════════════════════════════════════════════════════ */
export const updateCurrentUser = (updates) => async (dispatch, getState) => {
    const { auth } = getState();
    if (!auth.currentUser) return;

    try {
        const { id, email, ...meta } = updates; // eslint-disable-line no-unused-vars
        const { data, error } = await supabase.auth.updateUser({ data: meta });
        if (!error && data.user) {
            const updated = { ...auth.currentUser, ...toReduxUser(data.user) };
            persistCurrentUser(updated);
            dispatch({ type: UPDATE_PROFILE, payload: updated });
        }
    } catch { /* ignore */ }
};

export const clearAuthError = () => ({ type: CLEAR_AUTH_ERROR });

/* ═══════════════════════════════════════════════════════════════════════════
   loadUsers — synchronous helper used by task/scrumboard dropdowns to list
   team members for "Assign to" / "Reporter" fields.
   Reads from localStorage (populated at login). Falls back to current user.
═══════════════════════════════════════════════════════════════════════════ */
const USER_KEYS = ['gv_crm_users', 'crm_users', 'users'];
const DEFAULT_ADMIN = { id: '1', name: 'Admin', username: 'admin', email: 'admin@geovision.com', role: 'admin' };

export const loadUsers = () => {
    for (const key of USER_KEYS) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) continue;
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length) {
                return parsed.map(({ password, ...u }) => u); // strip passwords
            }
        } catch { /* ignore */ }
    }

    // Fall back: build a single-user list from the persisted current user
    const current = loadCurrentUser();
    return current ? [current] : [DEFAULT_ADMIN];
};
