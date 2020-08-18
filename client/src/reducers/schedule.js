import { SOLD_STREAMS, PURCHASED_STREAMS } from './../actions/actionTypes';

const initialState = {
    sold: [],
    purchased: []
};

export default (state = initialState, action) => {
    switch (action.type) {
        case SOLD_STREAMS:
            return { ...state, sold: action.payload };
        case PURCHASED_STREAMS:
            return { ...state, purchased: action.payload };
        default:
            return state;
    }
}