import request from 'request';
import qs from 'querystring';
import url from 'url';

const config = {
  redirectUri: 'https://streamvi.ru/api/auth',
  accessTokenUri: 'https://streamvi.ru/api/auth?gettoken=',
  width: 650,
  height: 430
};

export const OAuth = (setAuth) => {
  return oauth2(config, setAuth)
    .then(openPopup)
    .then(pollPopup)
    .then(closePopup);
  /*    .then(exchangeVkCodeForToken);
  /*.then(signIn)
  .then(closePopup);*/
};

const oauth2 = (config, setAuth) => {
  return new Promise((resolve, reject) => {
    request.get({ url: config.redirectUri, json: true }, (err, res, body) => {
      if (body) {
        resolve({ url: body.url, config, setAuth });
      }
    });
  });
};

/*
    return new Promise((resolve, reject) => {
        const params = {
            client_id: config.clientId,
            redirect_uri: config.redirectUri,
            scope: config.scope,
            display: config.display,
            response_type: config.response_type,
            v: config.v
        };
        const url = config.authorizationUrl + '?' + qs.stringify(params);
        resolve({ url: url, config: config });
    });*/
//}

const openPopup = ({ url, config, setAuth }) => {
  return new Promise((resolve, reject) => {
    const width = config.width || 500;
    const height = config.height || 500;
    const options = {
      width: width,
      height: height,
      top: window.screenY + ((window.outerHeight - height) / 2.5),
      left: window.screenX + ((window.outerWidth - width) / 2)
    };
    const popup = window.open(url, '_blank', qs.stringify(options, ','));

    if (url === 'about:blank') {
      popup.document.body.innerHTML = 'Loading...';
    }

    resolve({ window: popup, config, setAuth });
  });
};

const pollPopup = ({ window, config, setAuth }) => {
  return new Promise((resolve, reject) => {
    const redirectUri = url.parse(config.redirectUri);
    const redirectUriPath = redirectUri.host + redirectUri.pathname;
    /*if (access_token) {
        window.location = config.authorizationUrl + '?' + qs.stringify(access_token);
    }*/
    const polling = setInterval(() => {
      if (!window || window.closed) {
        clearInterval(polling);
      }
      try {
        const popupUrlPath = window.location.host + window.location.pathname;
        if (popupUrlPath === redirectUriPath) {
          if (window.location.search) {
            const query = qs.parse(window.location.search.substring(1).replace(/\/$/, ''));
            const params = Object.assign({}, query);
            if (params.error) {

              reject({ error: params.error })

            } else {
              request.get({ url: `${config.accessTokenUri}${params.code}`, json: true }, (err, res, body) => {
                if (body) {
                  resolve({ oauthData: body, window, interval: polling, setAuth });
                  //resolve({ url: body.url, config });
                }
                else alert(err);
              });

              //resolve({ oauthData: params, config: config, window: window, interval: polling });
            }
          } else {
            reject({ error: 'OAuth redirect has occurred but no query or hash parameters were found.' });
          }
        }
      } catch (error) {
        // Ignore DOMException: Blocked a frame with origin from accessing a cross-origin frame.
        // A hack to get around same-origin security policy errors in Internet Explorer.
      }
    }, 500);
  });
};
/*
const exchangeVkCodeForToken = ({ oauthData, config, window, interval }) => {
    return alert(JSON.stringify(oauthData));
};
/*const data = Object.assign({}, oauthData, config);


   return new Promise((resolve, reject) => {
const data = Object.assign({}, oauthData, config);

var accessTokenUrl = 'https://oauth.vk.com/authorize';
var userApiUrl = 'https://api.vk.com/method/users.get?';
//var userApiUrl = 'http://propro.site/auth.php?';

var params = {
    v: 5.92,
    user_ids: data.user_id,
    access_token: data.access_token,
    fields: 'photo_50,photo_100',
    name_case: 'nom',
};
// Step 1. Exchange authorization code for access token.
/*request.get({ url: userApiUrl, qs: params, json: true }, function (err, response, accessToken) {
    if (accessToken.error) {
        reject({ response });
    }*/
// Step 2. Retrieve user's profile information.
////request.get({ url: userApiUrl, qs: params, json: true }, function (err, res, profile) {
/*if (profile.error) {
    reject({ response });
}*/
/*if (err) {
    alert(JSON.stringify(err));
    reject(err);
}*/
//else if (res) {
/*if (profile) {
    //const user = `${profile[0].id} ${profile[0].first_name} ${profile[0].last_name}`;
    alert(JSON.stringify(profile));
}
resolve({ window: window, interval: interval, profile: profile });
//}
});
//})
});
}
/*
const signIn = ({ token, user, window, interval, profile }) => {
return new Promise((resolve, reject) => {
resolve({ window: window, interval: interval, profile });
});

}

*/

const closePopup = ({ oauthData, window, interval, setAuth }) => {
  //setAuth(2);
  return new Promise((resolve, reject) => {
    //alert(JSON.stringify(oauthData));
    setAuth(oauthData);
    clearInterval(interval);
    window.close();
    resolve({ oauthData });
  });
};


