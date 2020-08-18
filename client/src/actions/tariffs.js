import Cookies from 'js-cookie';
import qs from 'querystring';
import {
  FETCH_DATA_START,
  FETCH_DATA_END,
  TARIFF,
  POPUP_MESSAGE,
  POPUP_SUCCESS,
  BALANCE
} from './../actions/actionTypes';

export const tariffState = data => dispatch => dispatch({ type: TARIFF, payload: data });

export const getTariff = () => (dispatch, getState) => {
  let status = false;
  if (getState().app.updating === 0) dispatch({ type: FETCH_DATA_START });
  const token = getState().app.token || Cookies.get('token');
  if (!token) {
    if (getState().app.updating === 1) dispatch({ type: FETCH_DATA_END });
    return new Promise(resolve => resolve(false));
  }
  const init = {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
  const url = `${window.location.protocol}//${window.location.host}/api/tariffs?${qs.stringify({ token })}`;
  return fetch(url, init)
    .then(response => {
      if (response.ok) return response.json();
      else return { status: false };
    })
    .then(data => {
      if (data.status === 'ok') {
        const tariff = data.tariff;
        const balance = data.balance;
        dispatch({ type: TARIFF, payload: { tariff } });
        dispatch({ type: BALANCE, payload: { balance } });
        status = true;
      }
      if (getState().app.updating === 1) dispatch({ type: FETCH_DATA_END });
      return status;
    });
};

export const changeTariff = amount => (dispatch, getState) => {
  let status = false;
  if (getState().app.updating === 0) dispatch({ type: FETCH_DATA_START });
  const token = getState().app.token || Cookies.get('token');
  if (!token) {
    if (getState().app.updating === 1) dispatch({ type: FETCH_DATA_END });
    return new Promise(resolve => resolve(false));
  }
  const init = {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ token, amount })
  };
  const url = `${window.location.protocol}//${window.location.host}/api/tariffs`;
  return fetch(url, init)
    .then(response => {
      if (response.ok) return response.json();
      else return { data: { status: false } };
    })
    .then(data => {
      if (data.status === 'ok') {
        const tariff = data.tariff;
        const balance = data.balance;
        dispatch({ type: TARIFF, payload: { tariff } });
        dispatch({ type: BALANCE, payload: { balance } });
        dispatch({ type: POPUP_MESSAGE, payload: {message: 'Тариф успешно изменен!'} });
        status = true;
      } else if (data.message) {
        dispatch({ type: POPUP_MESSAGE, payload: { message: data.message } });
      }
      if (getState().app.updating === 1) dispatch({ type: FETCH_DATA_END });
      return status;
    });
};

export const prolongTariff = () => (dispatch, getState) => {
  let status = false;
  if (getState().app.updating === 0) dispatch({ type: FETCH_DATA_START });
  const token = getState().app.token || Cookies.get('token');
  if (!token) {
    if (getState().app.updating === 1) dispatch({ type: FETCH_DATA_END });
    return new Promise(resolve => resolve(false));
  }
  const init = {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ token, action: 'prolong' })
  };
  const url = `${window.location.protocol}//${window.location.host}/api/tariffs`;
  return fetch(url, init)
    .then(response => {
      if (response.ok) return response.json();
      else return { data: { status: false } };
    })
    .then(data => {
      if (data.status === 'ok') {
        const tariff = data.tariff;
        const balance = data.balance;
        dispatch({ type: TARIFF, payload: { tariff } });
        dispatch({ type: BALANCE, payload: { balance } });
        dispatch({ type: POPUP_SUCCESS });
        status = true;
      } else if (data.message) {
        dispatch({ type: POPUP_MESSAGE, payload: { message: data.message } });
      }
      if (getState().app.updating === 1) dispatch({ type: FETCH_DATA_END });
      return status;
    });
};
