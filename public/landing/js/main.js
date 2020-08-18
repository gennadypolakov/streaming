const CHANNEL_PRICE = 150; // цена
const discount = 3; // скидка
const maxDiscount = 51; // макс скидка
const STEPS_VOL = 30 // макс объем

// header background color on scroll
window.onscroll = function () {
	let pageY = window.pageYOffset || document.documentElement.scrollTop;
	let header = document.getElementById('header');
	let $logo = document.getElementById('logo');

	if (pageY != 0) {
		header.classList.add('scroll');
		$logo.setAttribute('src', 'landing/assets/logo.svg');
	} else {
		header.classList.remove('scroll');
		$logo.setAttribute('src', 'landing/assets/logo-white.svg');
	}
}

document.addEventListener('DOMContentLoaded', function () {
	let priceInput = document.getElementById("price-input");
	let priceResult = document.getElementById("result");

	function changeEventHandler(event) {
		if (event && +event.target.value < 2) {
			priceInput.value = 2;
		}

		if (priceInput.value.indexOf('∞') !== -1 || +priceInput.value >= STEPS_VOL) {
			priceInput.value = '∞'; priceResult.innerHTML = '∞ р';
			return;
		}

		let totalDiscount = (+priceInput.value > 2) ? (+priceInput.value - 2) * discount : 0;
		if (totalDiscount > maxDiscount) { totalDiscount = maxDiscount; }
		priceResult.innerHTML = Math.ceil(CHANNEL_PRICE * (1 + (+priceInput.value - 2) * (1 - totalDiscount / 100))) + ' р';
	}

	priceInput.oninput = changeEventHandler;

	//slider
	let slider = document.getElementById('slider');
	noUiSlider.create(slider, {
		start: [2],
		step: 1,
		range: {
			'min': [2],
			'max': [STEPS_VOL]
		}
	});
	slider.noUiSlider.on('update', (values, handle, unencoded, tap, positions) => {
		priceInput.value = (+values).toFixed(0);
		if (+values === STEPS_VOL) {
			priceInput.value = '∞'
		}
		changeEventHandler();
	});
}, false);

function clickHandler(e) {
	e.preventDefault();
	let urlRedirect = window.location.protocol + '//' + window.location.host + '/api/auth';
	//let startUrl = 'http://streamvi.ru/load.html';

	const popupWindow = openPopup(urlRedirect);
	// const popupWindow = openPopup(startUrl);
	// const xhr = new XMLHttpRequest();
	// xhr.open('GET', urlRedirect);
	// xhr.send();
	// xhr.onreadystatechange = function () {
	// 	if (this.readyState != 4) return;

	// 	if (this.status != 200) {
	// 		// обработать ошибку
	// 		console.log('ошибка: ' + (this.status ? this.statusText : 'запрос не удался'));
	// 		return;
	// 	}
	// 	const responseJson = JSON.parse(this.responseText);
	// 	// получить результат из this.responseText или this.responseXML
	// 	console.log(responseJson.url);
	// 	popupWindow.location.href = responseJson.url;
	// 	return pollPopup(popupWindow);
	// }
	return pollPopup(popupWindow);
}

function openPopup(url) {

	const options = {
		top: window.screenY + ((window.outerHeight - 300) / 2.5),
		left: window.screenX + ((window.outerWidth - 500) / 2)
	};
	const popup = window.open(url, '_blank', 'menubar=no,toolbar=no,status=no,width=500,height=300' + ',top=' + options.top + ',left=' + options.left);

	if (url === 'about:blank') {
		popup.document.body.innerHTML = 'Loading...';
	}

	return popup;
}

function pollPopup(popup) {
	const redirectUriPath = 'streamvi.ru/api/auth';


	const polling = setInterval(() => {
		if (!popup || popup.closed) {
			clearInterval(polling);
		}
		try {
			if (popup.location.pathname === '/success.html') {
				return closePopup(popup, polling);
			}
			// const popupUrlPath = popup.location.host + popup.location.pathname;
			// if (popupUrlPath === redirectUriPath) {
			// 	const parsedUrl = new URL(popup.location.href);
			// 	const code = parsedUrl.searchParams.get("code"); // 123
			// 	if (code) {
			// 		const xhr = new XMLHttpRequest();
			// 		xhr.open('GET', 'http://streamvi.ru/api/auth?gettoken=' + code);
			// 		xhr.send();
			// 		xhr.onreadystatechange = function () {
			// 			if (this.readyState != 4) {
			// 				return closePopup(popup, polling);
			// 			}
			// 			if (this.status != 200) {
			// 				// обработать ошибку
			// 				console.log('ошибка: ' + (this.status ? this.statusText : 'запрос не удался'));
			// 				return closePopup(popup, polling);
			// 			}
			// 			const responseJson = JSON.parse(this.responseText);
			// 			// получить результат из this.responseText или this.responseXML
			// 			console.log('token: ' + responseJson.token);
			// 			var date = new Date(new Date().getTime() + 60 * 60 * 24 * 1000);
			// 			document.cookie = "token=" + responseJson.token + "; path=/; expires=" + date.toUTCString();
			// 			return closePopup(popup, polling);
			// 		}
			// 	} else {
			// 		return closePopup(popup, polling);
			// 	}
			// }
		} catch (error) {
			// Ignore DOMException: Blocked a frame with origin from accessing a cross-origin frame.
			// A hack to get around same-origin security policy errors in Internet Explorer.
		}
	}, 500);
}

function closePopup(popup, interval) {
	clearInterval(interval);
	popup.close();
	window.location.assign('/');
}

document.addEventListener('DOMContentLoaded', function () {
	const loginButton = document.getElementsByClassName('navbar__top-button')[0];
	loginButton.addEventListener('click', clickHandler);
});
