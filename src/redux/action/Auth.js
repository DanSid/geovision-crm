import { AUTH_ERROR, CLEAR_AUTH_ERROR, LOGIN_SUCCESS, LOGOUT, REGISTER_SUCCESS, UPDATE_PROFILE } from '../constants/Auth';

const USER_KEYS = ['gv_crm_users', 'crm_users', 'users'];
const CURRENT_USER_KEYS = ['gv_crm_current_user', 'crm_current_user', 'currentUser', 'auth_user'];
const DEFAULT_ADMIN = { id: '1', name: 'Admin', username: 'admin', email: 'admin@geovision.com', password: 'admin123', role: 'admin' };

const safeParse = (value, fallback = null) => {
    try { return value ? JSON.parse(value) : fallback; } catch { return fallback; }
};

const normalizeUser = (user = {}) => ({
    id: String(user.id ?? Date.now()),
    name: user.name || user.fullName || user.username || 'User',
    username: user.username || (user.email ? String(user.email).split('@')[0] : `user${Date.now()}`),
    email: (user.email || '').toLowerCase(),
    password: user.password || '',
    role: user.role || 'user',
});

const persistUsers = (users) => {
    USER_KEYS.forEach((key) => {
        try { localStorage.setItem(key, JSON.stringify(users)); } catch { /* ignore */ }
    });
};

const persistCurrentUser = (user) => {
    CURRENT_USER_KEYS.forEach((key) => {
        try { localStorage.setItem(key, JSON.stringify(user)); } catch { /* ignore */ }
    });
};

const clearCurrentUser = () => {
    CURRENT_USER_KEYS.forEach((key) => {
        try { localStorage.removeItem(key); } catch { /* ignore */ }
    });
};

export const loadUsers = () => {
    for (const key of USER_KEYS) {
        const parsed = safeParse(localStorage.getItem(key), null);
        if (Array.isArray(parsed) && parsed.length) {
            const normalized = parsed.map(normalizeUser);
            const hasAdmin = normalized.some((user) => user.email === DEFAULT_ADMIN.email || user.username === DEFAULT_ADMIN.username);
            const seeded = hasAdmin ? normalized : [DEFAULT_ADMIN, ...normalized];
            persistUsers(seeded);
            return seeded;
        }
    }
    persistUsers([DEFAULT_ADMIN]);
    return [DEFAULT_ADMIN];
};

export const loadCurrentUser = () => {
    for (const key of CURRENT_USER_KEYS) {
        const parsed = safeParse(localStorage.getItem(key), null);
        if (parsed && (parsed.email || parsed.username)) {
            const normalized = normalizeUser(parsed);
            const { password, ...safeUser } = normalized;
            persistCurrentUser(safeUser);
            return safeUser;
        }
    }
    return null;
};

export const loginUser = (email, password) => (dispatch) => {
    const users = loadUsers();
    const value = String(email || '').trim().toLowerCase();
    const pass = String(password || '');
    const user = users.find((u) => (u.email === value || String(u.username).toLowerCase() === value) && u.password === pass);

    if (user) {
        const { password: _pw, ...safeUser } = user;
        persistCurrentUser(safeUser);
        dispatch({ type: LOGIN_SUCCESS, payload: safeUser });
        return true;
    }

    dispatch({ type: AUTH_ERROR, payload: 'Invalid email/username or password.' });
    return false;
};

export const registerUser = (userData) => (dispatch) => {
    const users = loadUsers();
    const email = String(userData.email || '').trim().toLowerCase();
    const username = String(userData.username || '').trim();
    const exists = users.find((u) => u.email === email || String(u.username).toLowerCase() === username.toLowerCase());
    if (exists) {
        dispatch({ type: AUTH_ERROR, payload: 'Email or username already exists.' });
        return false;
    }

    const newUser = normalizeUser({
        id: Date.now(),
        name: userData.name,
        username,
        email,
        password: userData.password,
        role: 'user',
    });

    const updated = [...users, newUser];
    persistUsers(updated);
    const { password: _pw, ...safeUser } = newUser;
    persistCurrentUser(safeUser);
    dispatch({ type: REGISTER_SUCCESS, payload: safeUser });
    return true;
};

export const logoutUser = () => (dispatch) => {
    clearCurrentUser();
    dispatch({ type: LOGOUT });
};

export const clearAuthError = () => ({ type: CLEAR_AUTH_ERROR });

export const updateCurrentUser = (updates) => (dispatch, getState) => {
    const { auth } = getState();
    if (!auth.currentUser) return;
    const updated = { ...auth.currentUser, ...updates };
    persistCurrentUser(updated);
    // Also update the user in the users list
    const users = loadUsers();
    const newUsers = users.map((u) => u.id === updated.id ? { ...u, ...updates } : u);
    persistUsers(newUsers);
    dispatch({ type: UPDATE_PROFILE, payload: updated });
};
