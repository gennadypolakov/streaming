import qs from 'querystring';
import { FETCH_DATA_START, FETCH_DATA_END, FOUND_CHANNELS, START, SUCCESS, FAILURE, CLEAR_STATUS } from './../actions/actionTypes';

export const searchChannels = (token, formData = false) => (dispatch, getState) => {
    if (!formData) formData = {
        action: 'search',
        token: token
    };
    dispatch({ type: FETCH_DATA_START });
    const init = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${token}`
        },
        body: qs.stringify(formData)
    };
    return fetch(`${window.location.protocol}//${window.location.host}/api/market`, init)
        .then((res) => {
            if (res.ok) return res.json();
        })
        .then(data => {
            if (data.status && data.status === 'ok') {
                const items = data.items;
                const found = {};
                const found_index = Object.keys(data.items).sort((a, b) => b - a);
                for (let id in items) {
                    found[id] = {
                        group_id: +items[id].group_id,
                        id: items[id].id,
                        price: +items[id].price,
                        name: items[id].name,
                        photo: items[id].type === 'vk' ? items[id].photo_50 : items[id].type === 'youtube' ? items[id].photo_default : '',
                        service: items[id].type === 'vk' ? 'VK' : items[id].type === 'youtube' ? 'Youtube' : '',
                        translation: true,
                        time: items[id].time
                    }
                }
                dispatch({ type: FOUND_CHANNELS, payload: { found, found_index } });
            }
            return dispatch({ type: FETCH_DATA_END });
        });
}

export const buyStreamTime = (token, formData) => dispatch => {
    dispatch({ type: START });
    const init = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${token}`
        },
        body: qs.stringify(formData)
    };
    //const request = new Request(`${window.location.protocol}//${window.location.host}/api/videos`);
    return fetch(`${window.location.protocol}//${window.location.host}/api/market`, init)
        .then((res) => {
            if (res.ok) return res.json();
        })
        .then(data => {
            setTimeout(() => dispatch({ type: CLEAR_STATUS }), 1500);
            if (data.status) {
                if (data.status === 'ok') return dispatch({ type: SUCCESS });
                else if (data.status === 'error') {
                    return dispatch({ type: FAILURE, payload: data.message });
                }
            }
            return dispatch({ type: FAILURE });
        });
}

