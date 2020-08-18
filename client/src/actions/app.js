import { push } from 'connected-react-router';
import Cookies from 'js-cookie';
import { login as loginApi } from '../api';
import { FETCH_DATA_START, FETCH_DATA_END, LOGIN, LOGOUT, ACTIVE_TAB, SET_POPUP, SET_STATE, BALANCE, POPUP_MESSAGE, POPUP_SUCCESS, POPUP_FAILURE, IS_MOBILE } from './actionTypes';

export const appState = (data) => dispatch => dispatch({ type: SET_STATE, payload: data });

export const logout = () => dispatch => dispatch({ type: LOGOUT });

export const updateStreamKey = () => (dispatch, getState) => {

  const updating = getState().app.updating;
  if (!updating) dispatch({ type: FETCH_DATA_START });
  let status = false;
  let token = getState().app.token || Cookies.get('token');
  if (!token) {
    dispatch({ type: FETCH_DATA_END });
    return new Promise(resolve => resolve(status));
  }
  const init = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ token })
  };
  const url = `${window.location.protocol}//${window.location.host}/api/key`;

  return fetch(url, init)
    .then(response => {
      if (response.ok) return response.json();
      else return { data: { status: false } };
    })
    .then(data => {
      console.log(data);
      if (data.rtmp) {
        const user = getState().app.user;
        const { rtmp } = data;
        dispatch({ type: SET_STATE, payload: { user: { ...user, rtmp } }});
        dispatch({ type: POPUP_SUCCESS });
        status = true;
      } else {
        dispatch({ type: POPUP_FAILURE });
      }
      if (getState().app.updating === 1) dispatch({ type: FETCH_DATA_END });
      return status;
    });
};

export const login = () => (dispatch, getState) => {

  const updating = getState().app.updating;
  if (!updating) dispatch({ type: FETCH_DATA_START });
  let status = false;
  let token = getState().app.token || Cookies.get('token');
  const search = getState().router.location.search;
  if (!token && !search) {
    dispatch({ type: FETCH_DATA_END });
    return new Promise(resolve => resolve(status));
  }
  const init = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ token })
  };
  const url = `${window.location.protocol}//${window.location.host}/api/auth${search}`;

  return fetch(url, init)
    .then(response => {
      if (response.ok) return response.json();
      else return { data: { status: false } };
    })
    .then(data => {
      if (data.user_id) {
        if (data.jwt) {
          token = data.jwt;
          Cookies.set('token', data.jwt, { expires: 30 });
        }
        dispatch({ type: LOGIN, payload: { user: data, token } });
        if (data.balance) dispatch({ type: BALANCE, payload: { balance: data.balance, history: data.history } });
        status = true;
      } else dispatch({ type: FETCH_DATA_END });
      return status;
    });
};

export const newUser = () => (dispatch, getState) => {
  if (getState().app.updating === 0) dispatch({ type: FETCH_DATA_START });
  let status = false;
  const user = getState().app.fetchedUser;
  const vk_access_token = getState().app.vk_access_token;
  if (!user && !vk_access_token) {
    if (getState().app.updating === 1) dispatch({ type: FETCH_DATA_END });
    return new Promise(resolve => resolve(status));
  }
  const init = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ user, vk_access_token })
  };
  const url = `${window.location.protocol}//${window.location.host}/api/auth`;
  return fetch(url, init)
    .then(response => {
      if (response.ok) return response.json();
      else return { data: { status: false } };
    })
    .then(data => {
      if (data.user_id) {
        let token = false;
        if (data.jwt) {
          token = data.jwt;
          Cookies.set('token', data.jwt, { expires: 30 });
        }
        dispatch({ type: LOGIN, payload: { user: data, token } });
        if (data.balance) dispatch({ type: BALANCE, payload: { balance: data.balance } });
        status = true;
      } else if (data.message) {
        dispatch({ type: POPUP_MESSAGE, payload: { message: data.message } });
      }
      if (getState().app.updating === 1) dispatch({ type: FETCH_DATA_END });
      return status;
    });
};

export const setActiveTab = (tab, path = false) => (dispatch) => {
  if (path) dispatch(push(path));
  else {
    if (tab === 'translations') dispatch(push('/'));
    else dispatch(push(`/${tab}`));
  }
  dispatch({ type: ACTIVE_TAB, payload: tab });
};

export const setPopup = (popout, message = false) => dispatch => dispatch({ type: SET_POPUP, payload: { popout, message } });

export const setIsMobile = (data) => (dispatch) => { dispatch({ type: IS_MOBILE, payload: data })};
