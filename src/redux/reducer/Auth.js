import { AUTH_ERROR, CLEAR_AUTH_ERROR, LOGIN_SUCCESS, LOGOUT, REGISTER_SUCCESS, UPDATE_PROFILE } from '../constants/Auth';
import { loadCurrentUser } from '../action/Auth';

const currentUser = loadCurrentUser();

const initialState = {
    currentUser,
    isAuthenticated: !!currentUser,
    error: null,
};

const AuthReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOGIN_SUCCESS:
        case REGISTER_SUCCESS:
        case UPDATE_PROFILE:
            return { ...state, currentUser: action.payload, isAuthenticated: true, error: null };
        case LOGOUT:
            return { ...state, currentUser: null, isAuthenticated: false, error: null };
        case AUTH_ERROR:
            return { ...state, error: action.payload };
        case CLEAR_AUTH_ERROR:
            return { ...state, error: null };
        default:
            return state;
    }
};

export default AuthReducer;
