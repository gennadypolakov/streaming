import { VIDEOS, SELECT_VIDEO, SELECT_VIDEOS, EDIT_VIDEO } from './../actions/actionTypes';

const initialState = {
    video: {},
    video_index: [],
    selectedVideos: [],
    updated: false,
    videoId: false
}

export default (state = initialState, { type, payload }) => {
    switch (type) {
        case VIDEOS:
            return { ...state, ...payload, updated: true };
        case SELECT_VIDEO:
            return { ...state, ...payload };
        case SELECT_VIDEOS:
            return { ...state, ...payload };
        case EDIT_VIDEO:
            return { ...state, videoId: payload };
        default:
            return state;
    }
};
