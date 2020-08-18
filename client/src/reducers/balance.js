import { BALANCE, HISTORY, REFERRALS } from './../actions/actionTypes';

const initialState = {
    referrals: [],
    balance: 0,
    profit: 0,
    history: [],
    loaded: false
};

export default (state = initialState, { type, payload }) => {
    switch (type) {
        case REFERRALS:
            return { ...state, ...payload };
        case BALANCE:
            return { ...state, ...payload };
        default:
            return state;
    }
};
