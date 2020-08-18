import { LoadData, Success, Failure } from '../components/loadData';
import { FETCH_DATA_START, FETCH_DATA_END, LOGIN, LOGOUT, START, SUCCESS, FAILURE, CLEAR_STATUS, POPUP_SUCCESS, POPUP_FAILURE, ACTIVE_TAB, SET_POPUP, POPUP_MESSAGE, SET_STATE, IS_MOBILE } from './../actions/actionTypes';

const initialState = {
    user: false,
    token: false,
    popout: 'hidden',
    loadData: false,
    process: null,
    activeTab: false,
    updating: 0,
    message: false
};

export default (state = initialState, { type, payload }) => {
    switch (type) {
        case SET_STATE:
            return { ...state, ...payload };
        case SET_POPUP:
            return { ...state, ...payload };
        case FETCH_DATA_START:
            return { ...state, updating: 1, popout: 'spinner' };
        case FETCH_DATA_END:
            return { ...state, updating: 0, popout: 'hidden' };
        case LOGIN:
            return { ...state, ...payload };
        case LOGOUT:
            return { ...state, user: false, token: false };
        case START:
            return { ...state, process: LoadData };
        case SUCCESS:
            return { ...state, process: Success };
        case FAILURE:
            return { ...state, process: payload ? Failure(payload) : Failure() };
        case POPUP_SUCCESS:
            return { ...state, updating: 2, popout: 'success' };
        case POPUP_FAILURE:
            return { ...state, updating: 2, popout: 'failure' };
        case POPUP_MESSAGE:
            return { ...state, updating: 2, popout: 'message', ...payload };
        case CLEAR_STATUS:
            return { ...state, process: null };
        case ACTIVE_TAB:
            return { ...state, activeTab: payload };
        case IS_MOBILE:
            return { ...state, isMobile: payload };
        default:
            return state;
    }
}