import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Route, Switch, withRouter } from 'react-router-dom';
import '@vkontakte/vkui/dist/vkui.css';
import connectVk from '@vkontakte/vkui-connect';

import { login, getUserChannels, getAvailableChannels, getPurchasedChannels, getTariff, soldStreams, purchasedStreams, setActiveTab, appState, setPopup, newUser, setIsMobile } from './actions';
import Translations from './Pages/Translations';
import Video from './Pages/Video';
import Market from './Pages/Market';
import Scheduler from './Pages/Sheduler';
import Partner from './Pages/Partner';
import Balance from './Pages/Balance';
import Account from './Pages/Account';
import Menu from './Pages/Menu';
import './App.scss';

class App extends Component {

	componentDidMount() {

		connectVk.subscribe(e => {
			switch (e.detail.type) {
				case 'VKWebAppGetUserInfoResult':
					this.props.appState({
						fetchedUser: e.detail.data,
						vkApp: true
					});
					break;
				case 'VKWebAppAccessTokenReceived':
					this.props.appState({
						vk_access_token: e.detail.data.access_token,
						vkApp: true
					});
					this.props.newUser()
						.then(status => {
							if (status) this.updateInfo();
						});
					break;
				case 'VKWebAppOpenPayFormResult':
					const data = e.detail.data;
					if (data.status) {
						this.props.login();
						this.props.setPopup(true);
					}
					break;
				case 'VKWebAppGetUserInfoFailed':
					console.log('error', e.detail.type);
				default:
					console.log(e.detail.type);
			}
		});

		connectVk.send('VKWebAppGetUserInfo', {});

		if(!this.props.user) {
			this.props.login()
				.then(status => {
					if (status) {
						this.updateInfo();
					} else {
						connectVk.send('VKWebAppGetAuthToken', { "app_id": 6958212, "scope": "groups" });
						if (this.props.fetchedUser && this.props.vk_access_token) {
							this.props.newUser();
						}
					}
				});
		}

		if(this.props.pathname) {
			if (this.props.pathname === '/') {
				this.props.setActiveTab('translations', '/' + this.props.search);
			} else {
				this.props.setActiveTab(this.props.pathname.split('/')[1], this.props.pathname + this.props.search);
			}
		}

		window.addEventListener("resize", event => {
			let width = window.innerWidth || document.documentElement.clientWidth || document.getElementsByTagName('body')[0].clientWidth;
			(width < 500) ? this.props.setIsMobile(true) : this.props.setIsMobile(false);
		});

	}

	// setAuth = (user) => {
	// 	const { cookies, login } = this.props;
	// 	cookies.set('token', user.token, { path: '/' });
	// 	login(user, true);
	// }

	updateInfo = () => {
		this.props.getUserChannels()
			.then(this.props.soldStreams);
		this.props.getAvailableChannels();
		this.props.getPurchasedChannels()
			.then(this.props.purchasedStreams);
		this.props.getTariff();
	};

	render() {
		return !this.props.activeTab ? null : <Switch>
			<Route path='/' exact component={Translations} />
			<Route path='/services' exact component={Translations} />
			<Route path='/groups' exact component={Translations} />
			<Route path='/video' exact component={Video} />
			<Route path='/video/album/:id' exact component={Video} />
			<Route path='/market' exact component={Market} />
			<Route path='/schedule' exact component={Scheduler} />
			<Route path='/partner' exact component={Partner} />
			<Route path='/balance' component={Balance} />
			<Route path='/account' exact component={Account} />
			<Route path='/menu' exact component={Menu} />
			<Route component={Translations} />
		</Switch>;
	}
}

const mapStateToProps = state => {
	return {
		popout: state.app.popout,
		user: state.app.user,
		activeTab: state.app.activeTab,
		fetchedUser: state.app.fetchedUser,
		vk_access_token: state.app.vk_access_token,
		pathname: state.router.location.pathname,
		search: state.router.location.search,
		isMobile: state.app.isMobile
	};
};

const mapDispatchToProps = {
	login,
	getAvailableChannels,
	getPurchasedChannels,
	getTariff,
	getUserChannels,
	soldStreams,
	purchasedStreams,
	setActiveTab,
	appState,
	setPopup,
	newUser,
	setIsMobile
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
