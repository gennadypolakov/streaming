import { USER_CHANNELS, DISABLED_USER_CHANNELS, AVAILABLE_CHANNELS, FOUND_CHANNELS, PURCHASED_CHANNELS, USERS, BROADCAST, CHANNEL_STATE } from './../actions/actionTypes';

const initialState = {
    owner: {},
    owner_index: [],
    shared: {},
    shared_index: [],
    disabled: {},
    disabled_index: {
        vk: [],
        youtube: [],
        twitch: [],
        custom: [],
        ok: []
    },
    available: {},
    available_index: [],
    purchased: {},
    purchased_index: [],
    loaded: false,
    selectedType: 'owner'
};

export default (state = initialState, { type, payload }) => {
    switch (type) {
        case USER_CHANNELS:
            return { ...state, ...payload, loaded: true };
        case DISABLED_USER_CHANNELS:
            return { ...state, ...payload };
        case AVAILABLE_CHANNELS:
            return { ...state, ...payload };
        case FOUND_CHANNELS:
            return { ...state, ...payload };
        case PURCHASED_CHANNELS:
            return { ...state, ...payload };
        case USERS:
            return {
                ...state,
                owner: {
                    ...state.owner,
                    [payload.group_id]: {
                        ...state.owner[payload.group_id],
                        users: payload.users
                    }
                }
            };
        case BROADCAST:
            return {
                ...state,
                [payload.owner]: {
                    ...state[payload.owner],
                    [payload.group_id]: {
                        ...state[payload.owner][payload.group_id],
                        active: +!state[payload.owner][payload.group_id].active
                    }
                }
            };
        case CHANNEL_STATE:
            return {
                ...state,
                ...payload
            };
        default:
            return state;
    }
}
