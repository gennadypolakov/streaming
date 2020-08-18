import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Group, Panel, ScreenSpinner, View, List } from '@vkontakte/vkui';

import User from './../../components/User';
import PageHeader from './../../components/PageHeader';

import './main.scss';


class Account extends Component {

	constructor(props) {
		super(props);

		this.state = {
		}
	}

	componentDidMount() {
		document.title = 'Аккаунт';
	}


	popout = () => {
		const popup = this.props.popout
		switch (popup) {
			case 'hidden':
				return null;
			case 'spinner':
				return <ScreenSpinner />;
			default:
				return null;
		}
	}

	render() {

		return <View
			activePanel={this.props.activeTab}
			popout={this.popout()}
		>
			<Panel id={this.props.activeTab}>
				<PageHeader />
				<Group
					style={{
						paddingTop: 60,
						paddingBottom: 60,
						color: 'gray'
					}}
					className={this.props.activeTab}
				>
					<List>
						{this.props.user ? <User /> : null}
					</List>
				</Group>
			</Panel>
		</View>
	}
}


const mapStateToProps = state => {
	return {
		user: state.app.user,
		activeTab: state.app.activeTab
	};
};

const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(Account);
