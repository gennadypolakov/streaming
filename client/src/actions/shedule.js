import { SOLD_STREAMS, PURCHASED_STREAMS } from './../actions/actionTypes';

export const soldStreams = (id = 0) => (dispatch, getState) => {
    const state = getState();
    const owner = state.channels.owner;
    let events = [];
    if (id == 0) {
        for (let i in owner) {
            if (owner[i].time && owner[i].time.length > 0) {
                events = [
                    ...events,
                    ...owner[i].time.map(item => {
                        return {
                            title: owner[i].name,
                            start: new Date(item.start * 1000),
                            end: new Date(item.end * 1000)
                        };
                    })
                ];
            }
        }
    } else if (owner[id]) {
        if (owner[id].time && owner[id].time.length > 0) {
            events = owner[id].time.map((item, i) => {
                return {
                    title: owner[id].time[i].video && owner[id].time[i].video.length > 0 ? owner[id].time[i].video.map(v => v.name).join(', ') : 'прямой эфир',
                    start: new Date(item.start * 1000),
                    end: new Date(item.end * 1000)
                };
            });
        }
    }
    return dispatch({ type: SOLD_STREAMS, payload: events });
}

export const purchasedStreams = (id = 0) => (dispatch, getState) => {
    const state = getState();
    const purchased = state.channels.purchased;
    let events = [];
    if (id == 0) {
        for (let i in purchased) {
            if (purchased[i].time && purchased[i].time.length > 0) {
                events = [
                    ...events,
                    ...purchased[i].time.map(item => {
                        return {
                            title: purchased[i].name,
                            start: new Date(item.start * 1000),
                            end: new Date(item.end * 1000)
                        };
                    })
                ];
            }
        }
    } else if (purchased[id]) {
        if (purchased[id].time && purchased[id].time.length > 0) {
            events = purchased[id].time.map((item, i) => {
                return {
                    title: purchased[id].time[i].video && purchased[id].time[i].video.length > 0 ? purchased[id].time[i].video.map(v => v.name).join(', ') : 'прямой эфир',
                    start: new Date(item.start * 1000),
                    end: new Date(item.end * 1000)
                };
            });
        }
    }
    return dispatch({ type: PURCHASED_STREAMS, payload: events });
}
