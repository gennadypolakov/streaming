// import request from 'request';
import qs from 'querystring';

// export const authRequest = ({ method, url, token, body }) => {
//     return new Promise((resolve, reject) => {
//         const config = {
//             url: url,
//             headers: {
//                 'Authorization': 'Bearer ' + token
//             }
//         }
//         if (method === 'GET') {
//             config.method = 'GET';
//             if (body) config.qs = body;
//         } else if (method === 'POST') {
//             config.method = 'POST';
//             if (body && body.formData) config.formData = body.formData;
//             else config.form = body;
//         }
//         try {
//             request(config, (err, res, body) => {
//                 if (!err && res.statusCode == 200) {
//                     console.log(JSON.parse(body))
//                     resolve(JSON.parse(body));
//                 }
//                 else console.log('request.js', err);
//             });
//         } catch (e) {
//             console.log('request.js catch!', e);
//         }
//     });
// };

export const authRequest = ({ method, url, token, body }) => {
    let uri = url;
    let init = {
        method,
        headers: {
            'Authorization': 'Bearer ' + token
        }
    }
    if (method === 'GET') {
        if (body) uri = `${uri}?${qs.stringify({ ...body, token })}`;
    } else if (method === 'POST') {
        if (body) {
            init = {
                ...init,
                headers: {
                    ...init.headers,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: qs.stringify(body)
            }
        }
    }
    return fetch(uri, init)
        .then(response => {
            try {
                if (response.ok) return response.json();
                else return false;
            } catch (e) {
                console.log('request.js catch', e);
                return false;
            }
        });
};
