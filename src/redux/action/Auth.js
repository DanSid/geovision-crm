import { AUTH_ERROR, CLEAR_AUTH_ERROR, LOGIN_SUCCESS, LOGOUT, REGISTER_SUCCESS, UPDATE_PROFILE } from '../constants/Auth';
import { authApi } from '../../services/api';

const USER_KEYS = ['gv_crm_users', 'crm_users', 'users'];
const CURRENT_USER_KEYS = ['gv_crm_current_user', 'crm_current_user', 'currentUser', 'auth_user'];
const DEFAULT_USERS = [
    { id: '1', name: 'Admin', username: 'admin', email: 'admin@geovision.com', password: 'admin1234', role: 'admin' },
    { id: '2', name: 'Boatemaa', username: 'boatemaa', email: 'boatemaa@geovisionservices.com', password: 'Maame1234', role: 'user' },
    { id: '3', name: 'Ellis', username: 'ellis', email: 'ellis@geovisionservices.com', password: 'Ellis1234', role: 'user' },
    { id: '4', name: 'Nina', username: 'nina', email: 'nina@geovisionservices.com', password: 'Nina1234', role: 'user' },
];

const safeParse = (value, fallback = null) => {
    try { return value ? JSON.parse(value) : fallback; } catch { return fallback; }
};

const normalizeUser = (user = {}) => ({
    id: String(user.id ?? user._id ?? Date.now()),
    name: user.name || user.fullName || user.username || 'User',
    username: user.username || (user.email ? String(user.email).split('@')[0] : `user${Date.now()}`),
    email: (user.email || '').toLowerCase(),
    password: user.password || '',
    role: user.role || 'user',
    photo: user.photo || '',
    designation: user.designation || '',
    bio: user.bio || '',
    city: user.city || '',
    country: user.country || '',
    phone: user.phone || '',
});

const withoutPassword = (user = {}) => {
    const normalized = normalizeUser(user);
    const { password, ...safeUser } = normalized;
    return safeUser;
};

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

const isOfflineApiError = (error) => !error?.response;

const mergeUsers = (existing = [], incoming = []) => {
    const map = new Map();
    [...existing, ...incoming].forEach((user) => {
        const normalized = normalizeUser(user);
        map.set(String(normalized.id), normalized);
    });
    return Array.from(map.values());
};

const syncUsersFromServer = async () => {
    const { data } = await authApi.listUsers();
    const users = (Array.isArray(data) ? data : []).map(withoutPassword);
    persistUsers(users);
    return users;
};

export const loadUsers = () => {
    for (const key of USER_KEYS) {
        const parsed = safeParse(localStorage.getItem(key), null);
        if (Array.isArray(parsed) && parsed.length) {
            const normalized = parsed.map(normalizeUser);
            const seeded = mergeUsers(DEFAULT_USERS, normalized);
            persistUsers(seeded);
            return seeded;
        }
    }
    persistUsers(DEFAULT_USERS);
    return DEFAULT_USERS;
};

export const loadCurrentUser = () => {
    for (const key of CURRENT_USER_KEYS) {
        const parsed = safeParse(localStorage.getItem(key), null);
        if (parsed && (parsed.email || parsed.username)) {
            const safeUser = withoutPassword(parsed);
            persistCurrentUser(safeUser);
            return safeUser;
        }
    }
    return null;
};

export const loginUser = (email, password) => async (dispatch) => {
    const value = String(email || '').trim().toLowerCase();
    const pass = String(password || '');

    try {
        const { data } = await authApi.login({ email: value, password: pass });
        const safeUser = withoutPassword(data);
        persistCurrentUser(safeUser);
        dispatch({ type: LOGIN_SUCCESS, payload: safeUser });

        try {
            await syncUsersFromServer();
        } catch {
            const merged = mergeUsers(loadUsers(), [safeUser]);
            persistUsers(merged.map(withoutPassword));
        }
        return true;
    } catch (error) {
        if (!isOfflineApiError(error)) {
            dispatch({ type: AUTH_ERROR, payload: error.response?.data?.message || 'Invalid email/username or password.' });
            return false;
        }
    }

    const users = loadUsers();
    const user = users.find((u) => (u.email === value || String(u.username).toLowerCase() === value) && u.password === pass);
    if (user) {
        const safeUser = withoutPassword(user);
        persistCurrentUser(safeUser);
        dispatch({ type: LOGIN_SUCCESS, payload: safeUser });
        return true;
    }

    dispatch({ type: AUTH_ERROR, payload: 'Invalid email/username or password.' });
    return false;
};

export const registerUser = (userData) => async (dispatch) => {
    const payload = {
        name: String(userData.name || '').trim(),
        username: String(userData.username || '').trim(),
        email: String(userData.email || '').trim().toLowerCase(),
        password: String(userData.password || ''),
        role: userData.role || 'user',
    };

    try {
        const { data } = await authApi.register(payload);
        const safeUser = withoutPassword(data);
        persistCurrentUser(safeUser);
        dispatch({ type: REGISTER_SUCCESS, payload: safeUser });

        try {
            await syncUsersFromServer();
        } catch {
            const existing = loadUsers().filter((user) => String(user.id) !== String(safeUser.id));
            persistUsers([...existing, safeUser].map(withoutPassword));
        }
        return true;
    } catch (error) {
        if (!isOfflineApiError(error)) {
            dispatch({ type: AUTH_ERROR, payload: error.response?.data?.message || 'Unable to create account.' });
            return false;
        }
    }

    const users = loadUsers();
    const exists = users.find((u) => u.email === payload.email || String(u.username).toLowerCase() === payload.username.toLowerCase());
    if (exists) {
        dispatch({ type: AUTH_ERROR, payload: 'Email or username already exists.' });
        return false;
    }

    const newUser = normalizeUser({
        id: Date.now(),
        ...payload,
    });
    const updated = [...users, newUser];
    persistUsers(updated);
    const safeUser = withoutPassword(newUser);
    persistCurrentUser(safeUser);
    dispatch({ type: REGISTER_SUCCESS, payload: safeUser });
    return true;
};

export const logoutUser = () => (dispatch) => {
    clearCurrentUser();
    dispatch({ type: LOGOUT });
};

export const clearAuthError = () => ({ type: CLEAR_AUTH_ERROR });

export const updateCurrentUser = (updates) => async (dispatch, getState) => {
    const { auth } = getState();
    if (!auth.currentUser) return;

    try {
        const { data } = await authApi.updateUser(auth.currentUser.id, updates);
        const safeUser = withoutPassword(data);
        persistCurrentUser(safeUser);

        const existing = loadUsers().filter((user) => String(user.id) !== String(safeUser.id));
        persistUsers([...existing, safeUser].map(withoutPassword));

        dispatch({ type: UPDATE_PROFILE, payload: safeUser });
        return;
    } catch (error) {
        if (!isOfflineApiError(error)) {
            dispatch({ type: AUTH_ERROR, payload: error.response?.data?.message || 'Unable to update profile.' });
            return;
        }
    }

    const updated = { ...auth.currentUser, ...updates };
    persistCurrentUser(updated);
    const users = loadUsers();
    const newUsers = users.map((user) => String(user.id) === String(updated.id) ? { ...user, ...updates } : user);
    persistUsers(newUsers);
    dispatch({ type: UPDATE_PROFILE, payload: updated });
};
