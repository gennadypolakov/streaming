import Cookies from 'js-cookie';
import { FETCH_DATA_START, FETCH_DATA_END, VIDEOS, EDIT_VIDEO, SELECT_VIDEO, START, SUCCESS, FAILURE, CLEAR_STATUS, SET_POPUP } from './../actions/actionTypes';
import { authRequest } from '../utils/requests';
import qs from 'querystring';

export const getVideos = () => (dispatch, getState) => {
  let status = false;
  if (!getState().app.updating) dispatch({ type: FETCH_DATA_START });
  const token = getState().app.token || Cookies.get('token');
  if (!token) {
    if (getState().app.updating) dispatch({ type: FETCH_DATA_END });
    return status;
  }
  return authRequest({
    method: 'GET',
    url: `${window.location.protocol}//${window.location.host}/api/videos`,
    token: token,
    body: { token: token }
  }).then(data => {
    if (data.items) {
      const video = data.items;
      const video_index = Object.keys(video).sort((a, b) => b - a);
      dispatch({ type: VIDEOS, payload: { video, video_index } });
      status = true;
    }
    if (getState().app.updating) dispatch({ type: FETCH_DATA_END });
    return status;
  });
};

export const addVideo = (token, formData) => dispatch => {
  dispatch({ type: FETCH_DATA_START });
  const headers = {
    'Content-Type': 'multipart/form-data',
    'Authorization': `Bearer ${token}`
  };
  const init = {
    method: 'POST',
    //headers,
    body: formData
  };
  return fetch(`${window.location.protocol}//${window.location.host}/api/videos`, init)
    .then((res) => {
      if (res.ok) return res.json();
    })
    .then(data => {
      if (data.items) {
        const video = data.items;
        const video_index = Object.keys(video).sort((a, b) => b - a);
        dispatch({ type: VIDEOS, payload: { video, video_index } });
      }
      return dispatch({ type: FETCH_DATA_END });
    });
};

export const editVideo = id => dispatch => {
  dispatch({ type: EDIT_VIDEO, payload: id });
  dispatch({ type: SET_POPUP, payload: { popout: 'formEditVideo' } });
};

export const editVideoApi = formData => (dispatch, getState) => {
  dispatch({ type: FETCH_DATA_START });
  const token = getState().app.token || Cookies.get('token');
  if (!token) return dispatch({ type: FETCH_DATA_END });
  const data = formData;
  data.token = token;
  const init = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${token}`
    },
    body: qs.stringify(data)
  };
  return fetch(`${window.location.protocol}//${window.location.host}/api/videos`, init)
    .then((res) => {
      if (res.ok) return res.json();
    })
    .then(data => {
      if (data.items) {
        const video = data.items;
        const video_index = Object.keys(video).sort((a, b) => b - a);
        dispatch({ type: VIDEOS, payload: { video, video_index } });
      }
      return dispatch({ type: FETCH_DATA_END });
    });
};

export const deleteVideo = id => (dispatch, getState) => {
  dispatch({ type: FETCH_DATA_START });
  const token = getState().app.token || Cookies.get('token');
  if (!token) return dispatch({ type: FETCH_DATA_END });
  return authRequest({
    method: 'GET', //change to POST
    url: `${window.location.protocol}//${window.location.host}/api/videos`,
    token,
    body: { token, id, action: 'delete' }
  }).then(data => {
    if (data.items) {
      const video = data.items;
      const video_index = Object.keys(video).sort((a, b) => b - a);
      dispatch({ type: VIDEOS, payload: { video, video_index } });
    }
    return dispatch({ type: FETCH_DATA_END });
  });
};

export const selectVideo = id => (dispatch, getState) => {
  dispatch({ type: FETCH_DATA_START });
  let { video, selectedVideos } = getState().videos;
  video[id].checked = !getState().videos.video[id].checked;
  const ind = selectedVideos.indexOf(id);
  if (video[id].checked) {
    if (ind === -1) {
      selectedVideos.push(id);
    }
  } else {
    if (ind !== -1) {
      selectedVideos = [
        ...selectedVideos.slice(0, ind),
        ...selectedVideos.slice(ind + 1)
      ];
    }
  }
  selectedVideos.sort((a, b) => a - b);
  setTimeout(() => dispatch({ type: FETCH_DATA_END }), 0);
  return dispatch({ type: SELECT_VIDEO, payload: { video, selectedVideos } });
};

export const setVideos2Streams = (token, formData) => dispatch => {
  dispatch({ type: START });
  const url = `${window.location.protocol}//${window.location.host}/api/videos`;
  const init = {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: qs.stringify(formData)
  };
  return fetch(url, init)
    .then((res) => {
      if (res.ok) return res.json();
    })
    .then(data => {
      setTimeout(() => dispatch({ type: CLEAR_STATUS }), 1500)
      if (data.status && data.status == 'ok') return dispatch({ type: SUCCESS });
      return dispatch({ type: FAILURE });
    });
};
