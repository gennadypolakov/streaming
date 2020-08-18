import { TARIFF } from './../actions/actionTypes';

const initialState = {
    tariff: false,
    balance: 0
};

export default (state = initialState, { type, payload }) => {
    switch (type) {
        case TARIFF:
            return { ...state, ...payload };
        default:
            return state;
    }
};
