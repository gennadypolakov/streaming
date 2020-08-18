import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Alert, Button, Div, Group, Panel, ScreenSpinner, Select, View } from '@vkontakte/vkui';
import 'fullcalendar-reactwrapper/dist/css/fullcalendar.min.css';
import FullCalendar from 'fullcalendar-reactwrapper';
import { soldStreams, purchasedStreams } from '../../actions';
import User from './../../components/User';
import PageHeader from './../../components/PageHeader';
import LoadData from '../../components/loadData';

class Scheduler extends Component {

	constructor(props) {
		super(props);

		this.state = {
			events: props.soldStreams().payload,
			shedulerSwitch: true,
			defaultView: 'month',
			defaultValue: 0
		}
	}

	componentDidMount() {
		document.title = "Расписание";
	}

	shedulerSwitch = () => {
		if (this.state.shedulerSwitch) {
			this.setState({
				shedulerSwitch: false,
				events: this.props.purchasedStreams().payload,
				defaultValue: 0
			});
		} else {

			this.setState({
				shedulerSwitch: true,
				events: this.props.soldStreams().payload,
				defaultValue: 0
			});
		}
	}

	showChannel = e => {
		const id = e.target.value;
		if (this.state.shedulerSwitch) {
			this.setState({
				defaultValue: id,
				events: this.props.soldStreams(id).payload
			});
		} else {
			this.setState({
				defaultValue: id,
				events: this.props.purchasedStreams(id).payload
			});
		}
	}

	popout = {
		closed: null,
		spinner: <ScreenSpinner />
	}

	render() {
		return <View
			activePanel={this.props.activeTab}
			popout={this.popout[this.props.popout]}
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
					{this.props.user ? <User /> : null}
					<Div>
						<Button
							style={{ marginRight: 5 }}
							level={this.state.shedulerSwitch ? 'primary' : 'outline'}
							onClick={this.shedulerSwitch}
						>Мои каналы</Button>
						<Button
							level={this.state.shedulerSwitch ? 'outline' : 'primary'}
							onClick={this.shedulerSwitch}
						>Мои трансляции</Button>
					</Div>
					<Div>
						<Select
							//placeholder="Выберите альбом"
							defaultValue={this.state.defaultValue}
							name="album"
							alignment="left"
							onChange={e => this.showChannel(e)}
						>
							<option key={0} value={0}>Все</option>
							{this.state.shedulerSwitch ?
								this.props.owner_index.map(id => <option key={id} value={id}>{this.props.owner[id].name}</option>)
								:
								this.props.purchased_index.map(id => <option key={id} value={id}>{this.props.purchased[id].name}</option>)
							}
						</Select>
					</Div>
					{this.props.loadData ? <LoadData /> :
						<Div>
							<FullCalendar
								id="GPL-My-Project-Is-Open-Source"
								locale="ru"
								header={{
									left: 'prev,today,next',
									center: 'title',
									right: 'agendaDay,agendaWeek,month',
								}}
								buttonText={
									{
										today: 'сегодня',
										month: 'месяц',
										week: 'неделя',
										day: 'день'
									}
								}
								editable={false}
								defaultView={this.state.defaultView}
								allDaySlot={false}
								selectHelper={true}
								droppable={true} // this allows things to be dropped onto the calendar !!!
								slotLabelFormat={'HH:mm'}
								defaultDate={new Date()}
								navLinks={true} // can click day/week names to navigate views
								eventLimit={true} // allow "more" link when too many events
								events={this.state.events}
								timeFormat={'HH:mm'}
								eventLimitText={'ещё'}
								dayPopoverFormat={'dddd, DD.MM.YY'}
								selectable={true}
								select={(start, end, jsEvent, view) => console.log(start, end, jsEvent, view)}
							// eventClick={console.log}
							//eventClick={(event, jsEvent, view) => console.log(event, jsEvent, view)}
							//eventMouseover={this.openPopup}
							//eventMouseout={this.props.popoutNull}
							/>
						</Div>}
				</Group>
			</Panel >
		</View >
	}
}

const mapStateToProps = state => {
	return {
		token: state.app.token,
		user: state.app.user,
		loadData: state.app.loadData,
		popout: state.app.popout,
		process: state.app.process,
		activeTab: state.app.activeTab,
		owner: state.channels.owner,
		owner_index: state.channels.owner_index,
		purchased: state.channels.purchased,
		purchased_index: state.channels.purchased_index
	};
};

const mapDispatchToProps = {
	soldStreams,
	purchasedStreams
}

export default connect(mapStateToProps, mapDispatchToProps)(Scheduler);
