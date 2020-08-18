import { ALBUMS, SELECT_ALBUM } from './../actions/actionTypes';

const initialState = {
    albums: {},
    albums_index: []
};

export default (state = initialState, { type, payload }) => {
    switch (type) {
        case ALBUMS:
            return { ...state, ...payload };
        case SELECT_ALBUM:
            return {
                ...state,
                albums: {
                    ...state.albums,
                    [payload]: {
                        ...state.albums[payload],
                        checked: !state.albums[payload].checked
                    }
                }
            };
        default:
            return state;
    }
};
