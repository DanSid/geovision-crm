import {
    DATA_HOVER,
    TOGGLE_COLLAPSED_NAV,
    TOGGLE_TOP_NAV
} from '../constants/Theme';
import { THEME_CONFIG } from '../../configs/ThemeConfig';

const initTheme = {
    ...THEME_CONFIG
}

const theme = (state = initTheme, action) => {
    switch (action.type) {
        case TOGGLE_COLLAPSED_NAV:
            return {
                ...state,
                navCollapsed: action.navCollapsed
            };
        case TOGGLE_TOP_NAV:
            return {
                ...state,
                topNavCollapsed: action.topNavCollapsed
            }
        case DATA_HOVER:
            return {
                ...state,
                dataHover: action.dataHover
            }
        default:
            return state;
    }
};

export default theme