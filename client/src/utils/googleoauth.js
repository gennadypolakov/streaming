// const config = {
//     redirectUri: `${window.location.protocol}//${window.location.host}/api/googleoauth`,
//     accessTokenUri: 'https://streamvi.ru/api/auth?gettoken=',
//     width: 650,
//     height: 430
// };

export const OAuth = ({ channelId, getChannel }) => {
    const popup = openBlankPopup(channelId);
    return pollPopup({ popup, getChannel })
        .then(closePopup);
};


const openBlankPopup = (channel) => {

    const options = {
        top: window.screenY + ((window.outerHeight - 400) / 2.5),
        left: window.screenX + ((window.outerWidth - 500) / 2)
    };
    const popupPathname = channel === '' ? '/api/googleoauth' : '/api/googleoauth?channel=' + channel;
    const popup = window.open(`${window.location.protocol}//streamvi.ru${popupPathname}`, '_blank', 'menubar=no,toolbar=no,status=no,width=500,height=400,top=' + options.top + ',left=' + options.left);
    return popup;
}


const pollPopup = ({ popup, getChannel }) => {
    return new Promise((resolve, reject) => {

        const polling = setInterval(() => {
            if (!popup || popup.closed) {
                clearInterval(polling);
            }
            try {
                const popupUrlPath = popup.location.pathname;
                if (popupUrlPath === '/success.html') {
                    resolve({ popup, getChannel, interval: polling });
                }
            } catch (error) {
                // Ignore DOMException: Blocked a frame with origin from accessing a cross-origin frame.
                // A hack to get around same-origin security policy errors in Internet Explorer.
            }
        }, 500);
    });
}

const closePopup = ({ popup, getChannel, interval }) => {
    getChannel();
    clearInterval(interval);
    popup.close();
}


