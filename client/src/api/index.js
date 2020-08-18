import qs from 'querystring';

export const login = (token, search) => {

    const init = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${token}`,
        },
        body: qs.stringify({ token })
    };

    const url = `${window.location.protocol}//${window.location.host}/api/auth${search}`;

    return fetch(url, init)
        .then(res => {
            if (res.ok) return res.json();
            else return false;
        });
}
