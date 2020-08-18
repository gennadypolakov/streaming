import Cookies from 'js-cookie';
import qs from 'querystring';
import { FETCH_DATA_START, FETCH_DATA_END, BALANCE, HISTORY, REFERRALS } from './../actions/actionTypes';

export const referrals = () => (dispatch, getState) => {
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
  const url = `${window.location.protocol}//${window.location.host}/api/balance?${qs.stringify({ token })}`;
  return fetch(url, init)
    .then(response => {
      if (response.ok) return response.json();
      else return { data: { status: false } };
    })
    .then(data => {
      if (data.status === 'ok') {
        const referrals = data.referrals;
        const profit = data.profit;
        const balance = data.balance;
        dispatch({ type: REFERRALS, payload: { balance, referrals, profit } });
        status = true;
      }
      if (getState().app.updating === 1) dispatch({ type: FETCH_DATA_END });
      return status;
    });
};

export const getBalance = () => (dispatch, getState) => {
  let status = false;
  const token = getState().app.token || Cookies.get('token');
  if (!token) {
    return new Promise(resolve => resolve(false));
  }
  const init = {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
  const url = `${window.location.protocol}//${window.location.host}/api/balance?${qs.stringify({ token })}`;
  return fetch(url, init)
    .then(response => {
      if (response.ok) return response.json();
      else return { data: { status: false } };
    })
    .then(data => {
      if (data.status === 'ok') {
        const { balance, history } = data;
        dispatch({ type: BALANCE, payload: { balance, history, loaded: true } });
        status = true;
      }
      return status;
    });
};

export const balanceHistory = () => (dispatch, getState) => {
  let status = false;
  const token = getState().app.token || Cookies.get('token');
  if (!token) {
    return new Promise(resolve => resolve(false));
  }
  const init = {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
  const url = `${window.location.protocol}//${window.location.host}/api/balance?${qs.stringify({ token })}`;
  return fetch(url, init)
    .then(response => {
      if (response.ok) return response.json();
      else return { data: { status: false } };
    })
    .then(data => {
      if (data.status === 'ok') {
        if(data.history){
          data.history.sort((a, b) => b.date - a.date);
        }
        delete data.status;
        dispatch({ type: BALANCE, payload: data });
        status = true;
      }
      return status;
    });
};
