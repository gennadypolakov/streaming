
const servicePath = {
    fb: 'fb',
    twitch: 'twitch',
    youtube: 'googleoauth'
};

export const OAuth2 = channelType => {
    const popup = openBlankPopup(channelType);
    return pollPopup(popup)
        .then(closePopup);
};


const openBlankPopup = channelType => {

    const options = {
        top: window.screenY + ((window.outerHeight - 400) / 2.5),
        left: window.screenX + ((window.outerWidth - 500) / 2)
    };
    const popupPathname = `/api/${servicePath[channelType]}`;
    const popup = window.open(
        // `${window.location.protocol}//${window.location.host}${popupPathname}`,
        `${window.location.protocol}//streamvi.ru${popupPathname}`,
        '_blank',
        'menubar=no,toolbar=no,status=no,width=500,height=400,top=' + options.top + ',left=' + options.left);
    return popup;
}


const pollPopup = popup => {
    return new Promise(resolve => {

        const polling = setInterval(() => {
            if (!popup || popup.closed) {
                clearInterval(polling);
            }
            try {
                const popupUrlPath = popup.location.pathname;
                if (popupUrlPath === '/success.html') {
                    resolve({popup, interval: polling});
                }
            } catch (error) {
                // Ignore DOMException: Blocked a frame with origin from accessing a cross-origin frame.
                // A hack to get around same-origin security policy errors in Internet Explorer.
            }
        }, 100);
    });
}

const closePopup = ({popup, interval}) => {
    if(popup && interval){
        clearInterval(interval);
        popup.close();
        return true;
    }
}


