import Cookies from 'js-cookie';
import { authRequest } from '../utils/requests';
import qs from 'querystring';
import {
  FETCH_DATA_START,
  FETCH_DATA_END,
  USER_CHANNELS,
  DISABLED_USER_CHANNELS,
  AVAILABLE_CHANNELS,
  PURCHASED_CHANNELS,
  CHANNEL_STATE,
  USERS,
  START,
  SUCCESS,
  FAILURE,
  CLEAR_STATUS,
  POPUP_SUCCESS,
  POPUP_FAILURE,
  BROADCAST,
  SET_STATE
} from './../actions/actionTypes';

const channelHandler = (data, getState) => {

  // const channels = getState().channels.owner_index;
  const serviceName = {
    vk: 'VK',
    youtube: 'Youtube',
    twitch: 'Twitch',
    custom: 'Свой сервер',
    ok: 'Одноклассники'
  };
  if (data.items && Object.keys(data.items).length > 0) {
    const items = data.items;
    const owner = {};
    const owner_index = [];
    const shared = {};
    const shared_index = [];
    const disabled = {};
    const disabled_index = {
      vk: [],
      youtube: [],
      twitch: [],
      custom: [],
      ok: []
    };
    let numActiveChannels = 0;
    for (let key in items) {
      if(!items.hasOwnProperty(key)) continue;
      let photo = '/app/img/logo/custom.png';
      if(items[key].type === 'vk') photo = items[key].photo_50;
      if(items[key].type === 'youtube' || items[key].type === 'twitch') photo = items[key].photo_default;
      if(items[key].type === 'ok') photo = '/app/img/logo/ok.png';
      let channelData = {
        group_id: +items[key].group_id,
        id: items[key].id,
        name: items[key].name,
        photo,
        service: serviceName[items[key].type],
        type: items[key].type,
        live: +items[key].live
      };
      if(items[key].preview){
        channelData.preview = items[key].preview;
      }
      if(items[key].title){
        channelData.title = items[key].title;
      }
      if (+items[key].del === 0) {
        if (items[key].owner) {
          owner[key] = {
            ...channelData,
            users: items[key].users,
            active: +items[key].active,
            time: items[key].time,
            sell: +items[key].sell,
            price: items[key].price ? +items[key].price : 0,
            rtmp: items[key].rtmp ? items[key].rtmp : false,
            owner: 'owner'
          };
          if (owner_index.indexOf(+key) === -1) owner_index.push(+key);
        } else {
          shared[key] = {
            ...channelData,
            active: +items[key].active,
            time: items[key].time,
            rtmp: !!items[key].rtmp,
            sharedTime: {
              unlim: +items[key].unlim ? 1 : 0,
              start: items[key].start,
              end: items[key].end
            },
            owner: 'shared'
          };
          if (shared_index.indexOf(+key) === -1) shared_index.push(+key);
        }
        if(!!Number(items[key].active)){
          numActiveChannels++;
        }
      } else if (+items[key].del === 1) {
        disabled[key] = channelData;
        if (disabled_index[items[key].type].indexOf(+key) === -1) disabled_index[items[key].type].push(+key);
      }
    }
    owner_index.sort((a, b) => b - a);
    shared_index.sort((a, b) => b - a);

    // const tempArr = [];
    // let addedChannelId;
    // if(channels.length === owner_index.length + 1){
    //   owner_index.forEach((id,) => {
    //     if (channels.indexOf(+id) === -1) tempArr.push(+id);
    //   });
    //   if(tempArr.length === 1){
    //     addedChannelId = tempArr[0];
    //   }
    // }
    // return { owner, owner_index, shared, shared_index, disabled, disabled_index, addedChannelId };
    return { owner, owner_index, shared, shared_index, disabled, disabled_index, numActiveChannels };
  }
  return {};
};

export const getUserChannels = () => (dispatch, getState) => {
  let status = false;
  if (getState().app.updating === 0) dispatch({ type: FETCH_DATA_START });
  const token = getState().app.token || Cookies.get('token');
  if (!token) {
    if (getState().app.updating) dispatch({ type: FETCH_DATA_END });
    return status;
  }

  setInterval(() => updateData(dispatch, getState), 30000);

  return authRequest({
    method: 'GET',
    url: `${window.location.protocol}//${window.location.host}/api/groups`,
    token,
    body: { token }
  }).then(data => {
    console.log('data', data);

    dispatch({ type: USER_CHANNELS, payload: channelHandler(data, getState) });
    status = true;
    if(data.addedChannelId){
      dispatch({ type: CHANNEL_STATE, payload: { addedChannelId: data.addedChannelId } });
    }
    // }
    if (getState().app.updating === 1) dispatch({ type: FETCH_DATA_END });
    return status;
  });
};

const updateData = (dispatch, getState) => {
  const token = getState().app.token || Cookies.get('token');
  return authRequest({
    method: 'GET',
    url: `${window.location.protocol}//${window.location.host}/api/groups`,
    token,
    body: { token }
  }).then(data => {
    dispatch({ type: USER_CHANNELS, payload: channelHandler(data, getState) });
  });
};


export const getAvailableChannels = () => (dispatch, getState) => {
  let status = false;
  if (!getState().app.updating) dispatch({ type: FETCH_DATA_START });
  const token = getState().app.token || Cookies.get('token');
  if (!token) {
    if (getState().app.updating) dispatch({ type: FETCH_DATA_END });
    return status;
  }
  return authRequest({
    method: 'GET',
    url: `${window.location.protocol}//${window.location.host}/api/groups`,
    token,
    body: { token, channels: 'available' }
  }).then(data => {
    if (data.items) {
      const items = data.items;
      const available = {};
      const available_index = [];
      for (let key in items) {
        if(!items.hasOwnProperty(key)) continue;
        available[key] = {
          group_id: +items[key].group_id,
          id: items[key].id,
          price: +items[key].price,
          name: items[key].name,
          photo: items[key].type === 'vk' ? items[key].photo_50 : items[key].type === 'youtube' ? items[key].photo_default : '',
          service: items[key].type === 'vk' ? 'VK' : items[key].type === 'youtube' ? 'Youtube' : '',
          translation: true,
          time: items[key].time
        };
        if (available_index.indexOf(+key) === -1) available_index.push(+key);
      }
      available_index.sort((a, b) => b - a);
      dispatch({ type: AVAILABLE_CHANNELS, payload: { available, available_index } });
      status = true;
    }
    if (getState().app.updating) dispatch({ type: FETCH_DATA_END });
    return status;
  });
};

export const addCustomRtmp = (data) => (dispatch, getState) => {
  if (!getState().app.updating) dispatch({ type: FETCH_DATA_START });
  const token = getState().app.token || Cookies.get('token');
  if (!token) {
    setTimeout(() => dispatch({ type: CLEAR_STATUS }), 1500);
    return new Promise(resolve => resolve(dispatch({ type: POPUP_FAILURE })));
  }
  const init = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ ...data, token, action: 'add_rtmp' })
  };
  return fetch(`${window.location.protocol}//${window.location.host}/api/groups`, init)
    .then(response => {
      if (response.ok) return response.json();
      else return false;
    })
    .then(data => {
      if (data) {
        dispatch({ type: USER_CHANNELS, payload: channelHandler(data, getState) });

        if(data.addedChannelId){
          dispatch({ type: CHANNEL_STATE, payload: { addedChannelId: data.addedChannelId } });
        }

      }

      if (getState().app.updating === 1) dispatch({ type: FETCH_DATA_END });

    });
};

export const saveChanges = formData => (dispatch, getState) => {
  if (!getState().app.updating) dispatch({ type: FETCH_DATA_START });
  // dispatch({ type: START });
  const token = getState().app.token || Cookies.get('token');
  if (!token) {
    // setTimeout(() => dispatch({ type: CLEAR_STATUS }), 1500)
    return new Promise(resolve => resolve(dispatch({ type: POPUP_FAILURE })));
  }
  const init = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ ...formData, token })
  };
  return fetch(`${window.location.protocol}//${window.location.host}/api/groups`, init)
    .then((res) => {
      if (res.ok) return res.json();
      else return { status: false };
    })
    .then(({ status }) => {
      setTimeout(() => dispatch({ type: CLEAR_STATUS }), 1500);
      if (status === 'ok') return dispatch({ type: POPUP_SUCCESS });
      return dispatch({ type: POPUP_FAILURE });
    });
};

export const addInfo = (formData) => (dispatch, getState) => {
  if (!getState().app.updating) dispatch({ type: FETCH_DATA_START });
  let status = false;
  const token = getState().app.token || Cookies.get('token');
  if (!token) {
    dispatch({ type: FETCH_DATA_END });
    return new Promise(resolve => resolve(status));
  }
  const headers = {
    'Content-Type': 'multipart/form-data',
    'Authorization': `Bearer ${token}`
  };
  formData.append('token', token);

  const init = {
    method: 'POST',
    // headers,
    body: formData
  };
  return fetch(`${window.location.protocol}//${window.location.host}/api/groups`, init)
    .then((res) => {
      if (res.ok) return res.json();
    })
    .then(({ status }) => {
      setTimeout(() => dispatch({ type: CLEAR_STATUS }), 1500);
      if (status === 'ok') return dispatch({ type: POPUP_SUCCESS });
      return dispatch({ type: POPUP_FAILURE });
    });
};

export const deletePreview = (group_id) => (dispatch, getState) => {
  if (!getState().app.updating) dispatch({ type: FETCH_DATA_START });
  let status = false;
  const token = getState().app.token || Cookies.get('token');
  if (!token) {
    dispatch({ type: FETCH_DATA_END });
    return new Promise(resolve => resolve(status));
  }
  const url = `${window.location.protocol}//${window.location.host}/api/groups`;
  const init = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ group_id, action: 'deletePreview', token }) // qs.stringify(formData)
  };
  return fetch(url, init)
    .then(response => {
      if (response.ok) return response.json();
      else return false;
    })
    .then(({ status }) => {
      console.log(status);
      setTimeout(() => dispatch({ type: CLEAR_STATUS }), 1500);
      if (status === 'ok') return dispatch({ type: POPUP_SUCCESS });
      return dispatch({ type: POPUP_FAILURE });
    });
};


// export const saveChanges = formData => (dispatch, getState) => {
//     // dispatch({ type: START });
//     const token = getState().app.token || Cookies.get('token');
//     if (!token) {
//         // setTimeout(() => dispatch({ type: CLEAR_STATUS }), 1500)
//         return new Promise(resolve => resolve(dispatch({ type: FAILURE })));
//     }
//     const init = {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify({ ...formData, token })
//     };
//     return fetch(`${window.location.protocol}//${window.location.host}/api/groups`, init)
//         .then((res) => {
//             if (res.ok) return res.json();
//             else return false;
//         })
//         .then(data => {
//             setTimeout(() => dispatch({ type: CLEAR_STATUS }), 1500)
//             if (data && data.status && data.status == 'ok') return dispatch({ type: SUCCESS });
//             return dispatch({ type: FAILURE });
//         });
// }

export const enableBroadcast = formData => (dispatch, getState) => {
  if (!getState().app.updating) dispatch({ type: FETCH_DATA_START });
  let status = false;
  const token = getState().app.token || Cookies.get('token');
  if (!token) {
    dispatch({ type: FETCH_DATA_END });
    return new Promise(resolve => resolve(status));
  }
  const url = `${window.location.protocol}//${window.location.host}/api/groups`;
  const init = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ ...formData, token }) // qs.stringify(formData)
  };
  return fetch(url, init)
    .then(response => {
      if (response.ok) {
        // return response.text();
        return response.json();
      }
      else return false;
    })
    .then(data => {
      if (data && data.status && data.status === 'ok') {
        dispatch({ type: BROADCAST, payload: formData });
        if(+formData.broadcast === 1){
          dispatch({ type: CHANNEL_STATE, payload: { numActiveChannels: ++getState().channels.numActiveChannels } });
        } else if(+formData.broadcast === 0) {
          dispatch({ type: CHANNEL_STATE, payload: { numActiveChannels: --getState().channels.numActiveChannels } });
        }
        status = true;
      }
      if (getState().app.updating) dispatch({ type: FETCH_DATA_END });
      return status;
    });
};

export const addUser = formData => (dispatch, getState) => {
  if (!getState().app.updating) dispatch({ type: FETCH_DATA_START });
  let status = false;
  const token = getState().app.token || Cookies.get('token');
  if (!token) {
    dispatch({ type: FETCH_DATA_END });
    return new Promise(resolve => resolve(status));
  }
  const url = `${window.location.protocol}//${window.location.host}/api/groups`;
  const init = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ ...formData, token }) // qs.stringify(formData)
  };
  return fetch(url, init)
    .then(response => {
      if (response.ok) return response.json();
      else return false;
    })
    .then(data => {
      if (data) {
        dispatch({ type: USERS, payload: data });
        status = true;
      }
      if (getState().app.updating) dispatch({ type: FETCH_DATA_END });
      return status;
    });
};

export const removeUser = (user_id, group_id) => (dispatch, getState) => {
  if (!getState().app.updating) dispatch({ type: FETCH_DATA_START });
  let status = false;
  const token = getState().app.token || Cookies.get('token');
  if (!token) {
    dispatch({ type: FETCH_DATA_END });
    return new Promise(resolve => resolve(status));
  }
  const url = `${window.location.protocol}//${window.location.host}/api/groups`;
  const init = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ user_id, group_id, access: 'delete', token }) // qs.stringify(formData)
  };
  return fetch(url, init)
    .then(response => {
      if (response.ok) return response.json();
      else return false;
    })
    .then(data => {
      if (data) {
        dispatch({ type: USERS, payload: data });
        status = true;
      }
      if (getState().app.updating) dispatch({ type: FETCH_DATA_END });
      return status;
    });
};

export const deleteChannel = (token, id) => dispatch => {
  dispatch({ type: START });
  const formData = {
    action: 'delete',
    group_id: id,
    token: token
  };
  const init = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${token}`
    },
    body: qs.stringify(formData)
  };
  return fetch(`${window.location.protocol}//${window.location.host}/api/groups`, init)
    .then((res) => {
      if (res.ok) return res.json();
    })
    .then(data => {
      setTimeout(() => dispatch({ type: CLEAR_STATUS }), 1500);
      if (data.status && data.status === 'ok') return dispatch({ type: SUCCESS });
      return dispatch({ type: FAILURE });
    });
};

export const getPurchasedChannels = () => (dispatch, getState) => {
  let status = false;
  if (!getState().app.updating) dispatch({ type: FETCH_DATA_START });
  const token = getState().app.token || Cookies.get('token');
  if (!token) {
    if (getState().app.updating) dispatch({ type: FETCH_DATA_END });
    return status;
  }
  const init = {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
  return fetch(`${window.location.protocol}//${window.location.host}/api/market?token=${token}`, init)
    .then(res => {
      if (res.ok) return res.json();
    })
    .then(data => {
      if (data.purchased) {
        const items = data.purchased;
        const purchased = {};
        const purchased_index = data.purchased_index.sort((a, b) => b - a);
        for (let key in items) {
          if(!items.hasOwnProperty(key)) continue;
          purchased[key] = {
            group_id: +items[key].group_id,
            id: items[key].id,
            price: +items[key].price,
            sell: +items[key].sell,
            name: items[key].name,
            photo: items[key].type === 'vk' ? items[key].photo_50 : items[key].type === 'youtube' ? items[key].photo_default : '',
            service: items[key].type === 'vk' ? 'VK' : items[key].type === 'youtube' ? 'Youtube' : '',
            translation: true,
            time: items[key].time,
            rtmp: items[key].rtmp ? items[key].rtmp : false
          }
        }
        dispatch({ type: PURCHASED_CHANNELS, payload: { purchased, purchased_index } });
        status = true;
      }
      if (getState().app.updating) dispatch({ type: FETCH_DATA_END });
      return status;
    });
};

export const channelState = data => dispatch => dispatch({ type: CHANNEL_STATE, payload: data });
