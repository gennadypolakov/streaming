import Cookies from 'js-cookie';
import qs from 'querystring';
import { authRequest } from '../utils/requests';
import { FETCH_DATA_START, FETCH_DATA_END, ALBUMS, SELECT_ALBUM, SELECT_VIDEOS } from './../actions/actionTypes';

export const addAlbum = name => (dispatch, getState) => {
    let status = false;
    if (!getState().app.updating) dispatch({ type: FETCH_DATA_START });
    const token = getState().app.token || Cookies.get('token');
    if (!token) {
        if (getState().app.updating) dispatch({ type: FETCH_DATA_END });
        return status;
    }
    const init = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${token}`
        },
        body: qs.stringify({ token, name })
    };
    const url = `${window.location.protocol}//${window.location.host}/api/albums`;
    return fetch(url, init)
        .then((res) => {
            if (res.ok) return res.json();
            else return false
        })
        .then(data => {
            if (data.items) {
                const albums = data.items;
                const albums_index = Object.keys(data.items).sort((a, b) => b - a);
                dispatch({ type: ALBUMS, payload: { albums, albums_index } });
                status = true;
            }
            if (getState().app.updating) dispatch({ type: FETCH_DATA_END });
            return status;
        });
}

export const selectAlbum = id => (dispatch, getState) => {
    dispatch({ type: FETCH_DATA_START });

    const checked = !getState().albums.albums[id].checked;
    dispatch({ type: SELECT_ALBUM, payload: +id })

    let { video, selectedVideos } = getState().videos;
    for (let i in video) {
        if (video[i].album && +video[i].album === +id) {
            video[i].checked = checked;
            const ind = selectedVideos.indexOf(+i);
            if (checked) {
                if (ind === -1) {
                    selectedVideos.push(+i);
                }
            } else {
                if (ind !== -1) {
                    selectedVideos = [
                        ...selectedVideos.slice(0, ind),
                        ...selectedVideos.slice(ind + 1)
                    ];
                }
            }
        }
    }
    setTimeout(() => dispatch({ type: FETCH_DATA_END }), 0);
    return dispatch({ type: SELECT_VIDEOS, payload: { video, selectedVideos } });
};

export const editAlbum = (id, name) => (dispatch, getState) => {
    let status = false;
    if (!getState().app.updating) dispatch({ type: FETCH_DATA_START });
    const token = getState().app.token || Cookies.get('token');
    if (!token) {
        if (getState().app.updating) dispatch({ type: FETCH_DATA_END });
        return status;
    }
    authRequest({
        method: 'GET', //change to POST
        url: `${window.location.protocol}//${window.location.host}/api/albums`,
        token: token,
        body: { token, id, name }
    }).then(data => {
        if (data.items) {
            const albums = data.items;
            const albums_index = Object.keys(data.items).sort((a, b) => b - a);
            dispatch({ type: ALBUMS, payload: { albums, albums_index } });
            status = true;
        }
        if (getState().app.updating) dispatch({ type: FETCH_DATA_END });
        return status;
    });
}

export const deleteAlbum = id => (dispatch, getState) => {
    let status = false;
    if (!getState().app.updating) dispatch({ type: FETCH_DATA_START });
    const token = getState().app.token || Cookies.get('token');
    if (!token) {
        if (getState().app.updating) dispatch({ type: FETCH_DATA_END });
        return status;
    }
    const init = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: qs.stringify({ token, id, action: 'delete' })
    };
    const url = `${window.location.protocol}//${window.location.host}/api/albums`;
    return fetch(url, init)
        .then((res) => {
            if (res.ok) return res.json();
            else return false
        })
        .then(data => {
            if (data.items) {
                const albums = data.items;
                const albums_index = Object.keys(data.items).sort((a, b) => b - a);
                dispatch({ type: ALBUMS, payload: { albums, albums_index } });
                status = true;
            }
            if (getState().app.updating) dispatch({ type: FETCH_DATA_END });
            return status;
        });
}

export const getAlbums = () => (dispatch, getState) => {
    let status = false;
    if (!getState().app.updating) dispatch({ type: FETCH_DATA_START });
    const token = getState().app.token || Cookies.get('token');
    if (!token) {
        if (getState().app.updating) dispatch({ type: FETCH_DATA_END });
        return new Promise(resolve => resolve(status));
    }
    const init = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };
    const url = `${window.location.protocol}//${window.location.host}/api/albums?token=${token}`;
    return fetch(url, init)
        .then((res) => {
            if (res.ok) return res.json();
            else return false
        })
        .then(data => {
            if (data && data.items) {
                const albums = data.items;
                const albums_index = Object.keys(data.items).sort((a, b) => b - a);
                dispatch({ type: ALBUMS, payload: { albums, albums_index } });
                status = true;
            }
            if (getState().app.updating) dispatch({ type: FETCH_DATA_END });
            return status;
        });
}

