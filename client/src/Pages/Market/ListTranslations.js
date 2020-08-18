import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Avatar, Button, Cell, Div, FormLayout, FormLayoutGroup, List } from '@vkontakte/vkui';
import Icon24Cancel from '@vkontakte/icons/dist/24/cancel';
import { MuiPickersUtilsProvider, DatePicker, DateTimePicker } from 'material-ui-pickers';
import DateFnsUtils from "@date-io/date-fns";
import { getTime, getUnixTime, endOfDay, startOfDay, format } from 'date-fns';
import ruLocale from "date-fns/locale/ru";
import { buyStreamTime, searchChannels, getUserChannels, soldStreams, getPurchasedChannels, purchasedStreams } from '../../actions';

class ListTranslations extends Component {
    constructor(props) {
        super(props);
        this.timeNow = new Date();
        this.state = {
            select: false,
            id: 0,
            price: 0,
            startOfDay: startOfDay(this.timeNow),
            endOfDay: endOfDay(this.timeNow),
            timeStart: this.timeNow,
            timeEnd: this.timeNow,
            changed: false, // были ли изменения
            disabled: false, // выключена ли кнопка покупки
            availableTime: null,
            minutesStep: 15
        }
    };

    selectChannel = (id = false) => {
        if (id) {
            this.getStreamTime(id);
            this.setState({ select: !this.state.select, id });
        } else this.setState({ select: !this.state.select, id: !this.state.id });
    };

    buyStreamTime = e => {
        e.preventDefault();
        this.setState({ disabled: true });
        let error = [];
        if (getTime(this.state.timeStart) >= getTime(this.state.timeEnd)) error = [
            ...error,
            'Некорректное время'
        ];

        if (this.props.token && error.length == 0) {
            const token = this.props.token;
            const formData = {
                group_id: this.state.id,
                time_start: getUnixTime(this.state.timeStart),
                time_end: getUnixTime(this.state.timeEnd),
                token: this.props.token,
                action: 'buy'
            };
            this.props.buyStreamTime(token, formData)
                .then(() => {
                    this.props.getUserChannels()
                        .then(this.props.soldStreams);
                    this.props.getPurchasedChannels()
                        .then(this.props.purchasedStreams);
                })
                .then(this.props.searchChannels(token))
                .then(this.getStreamTime(this.state.id))
                .then(this.setState({ disabled: false, error: false }));
        } else this.setState({ error });
    }

    getStreamTime = id => {
        this.setState({
            disabled: false,
            availableTime: <p style={{ color: 'green' }}>Трансляций не запланировано</p>,
        });
        const timeStreams = this.props.found[id].time;
        if (timeStreams) {
            const newTS = timeStreams.filter(item => (+item.start * 1000) > getTime(this.state.startOfDay) && (+item.start * 1000) < getTime(this.state.endOfDay));
            if (newTS.length > 0) {
                this.setState({
                    availableTime: <div style={{ color: 'red' }}>
                        <div>Недоступное для покупки время</div>
                        {newTS.map((item, i) => {
                            return (
                                <div key={i}>
                                    {format(item.start * 1000, 'dd.MM.yyyy HH:mm')}
                                    &nbsp;&nbsp;-&nbsp;&nbsp;
                                    {format(item.end * 1000, 'dd.MM.yyyy HH:mm')}
                                </div>
                            );
                        })}
                    </div>
                });
            }
        }
    }

    setStreamDate = date => {
        this.setState({
            disabled: false,
            availableTime: <p style={{ color: 'green' }}>Трансляций не запланировано</p>,
            startOfDay: startOfDay(date),
            endOfDay: endOfDay(date)
        });
        const timeStreams = this.props.found[this.state.id].time;
        if (timeStreams && this.state.id) {
            const newTS = timeStreams.filter(item => (+item.start * 1000) > getTime(startOfDay(date)) && (+item.start * 1000) < getTime(endOfDay(date)));
            if (newTS.length > 0) {
                this.setState({
                    availableTime: <div style={{ color: 'red' }}>
                        <div>Недоступное для покупки время</div>
                        {newTS.map((item, i) => {
                            return (
                                <div key={i}>
                                    {format(item.start * 1000, 'dd.MM.yyyy HH:mm')}
                                    &nbsp;&nbsp;-&nbsp;&nbsp;
                                    {format(item.end * 1000, 'dd.MM.yyyy HH:mm')}
                                </div>
                            );
                        })}
                    </div>
                });
            }
        }
    }

    changeTimeStart = time => {
        if (getTime(this.state.timeEnd) <= getTime(time)) this.setState({ timeEnd: new Date(time.getTime() + 3600000) });
        this.setState({ timeStart: time });
        this.setState({ disabled: false });
    };
    changeTimeEnd = time => {
        if (getTime(this.state.timeStart) >= getTime(time)) this.setState({ timeStart: new Date(time.getTime() - 3600000) });
        this.setState({ timeEnd: time });
        this.setState({ disabled: false });
    };

    getSum = () => {
        const { timeStart, timeEnd, id } = this.state;
        const price = this.props.found[id].price;
        let sum = 0;
        if (id) {
            sum = Math.ceil((getTime(timeEnd) - getTime(timeStart)) / 3600000 * (+price));
            if (sum < 0) {
                return <div style={{ color: 'red' }}>Время начала и конца указано некорректно!</div>;
            } else return <div>{sum} руб.</div>;
        }
        return <div>0 руб.</div>;
    }

    list = () => {
        if (this.props.found_index && this.props.found_index.length > 0) {
            return this.props.found_index.map(id =>
                <Cell
                    before={<Avatar size={40} src={this.props.found[id].photo} />}
                    onClick={() => this.selectChannel(id)}
                    size="l"
                    key={id}
                    asideContent={this.props.found[id].price + " руб / час"}
                    className='channel'
                >
                    {this.props.found[id].name}
                </Cell>
            );
        } else return null;
    }

    render() {

        const channels = this.props.found;
        const { id, timeStart, timeEnd, startOfDay, minutesStep } = this.state;

        return (
            <Div>
                {!this.state.select ? this.list() :
                    <List className="select-translation">
                        <Cell
                            onClick={() => this.selectChannel()}
                            asideContent={<Icon24Cancel />}>Покупка трансляции</Cell>
                        <Cell
                            before={<Avatar size={40} src={channels[id].photo} />}
                            size="l"
                            asideContent={channels[id].price + " руб/час"}
                        >
                            {channels[id].name}
                        </Cell>
                        <FormLayout onSubmit={this.buyStreamTime} getRef={v => this.formBuyTime = v}>
                            <div className="broadcast-date">
                                <MuiPickersUtilsProvider utils={DateFnsUtils} locale={ruLocale}>
                                    <DatePicker
                                        value={startOfDay}
                                        onChange={this.setStreamDate}
                                        minDate={new Date()}
                                        format={'dd.MM.yyyy'}
                                        ref={v => this.dateBroadcast = v}
                                        keyboard
                                        name="date"
                                        cancelLabel={'Отмена'}
                                    />
                                </MuiPickersUtilsProvider>
                            </div>
                            <div className="free-time">
                                {this.state.id ? this.state.availableTime : null}
                            </div>
                            <FormLayoutGroup top="Интервал трансляции" >
                                <div className="date-time">
                                    <MuiPickersUtilsProvider utils={DateFnsUtils} locale={ruLocale}>
                                        <DateTimePicker
                                            keyboard
                                            ampm={false}
                                            label="от"
                                            onError={console.log}
                                            minDate={this.timeNow}
                                            value={timeStart}
                                            onChange={this.changeTimeStart}
                                            format={'dd.MM.yyyy HH:mm'}
                                            disableOpenOnEnter
                                            mask={[/\d/, /\d/, '.', /\d/, /\d/, '.', /\d/, /\d/, /\d/, /\d/, ' ', /\d/, /\d/, ':', /\d/, /\d/]}
                                            minutesStep={minutesStep}
                                            cancelLabel={'Отмена'}
                                        />
                                        <DateTimePicker
                                            keyboard
                                            ampm={false}
                                            label="до"
                                            onError={console.log}
                                            minDate={this.timeNow}
                                            value={timeEnd}
                                            onChange={this.changeTimeEnd}
                                            format={'dd.MM.yyyy HH:mm'}
                                            disableOpenOnEnter
                                            mask={[/\d/, /\d/, '.', /\d/, /\d/, '.', /\d/, /\d/, /\d/, /\d/, ' ', /\d/, /\d/, ':', /\d/, /\d/]}
                                            minutesStep={minutesStep}
                                            cancelLabel={'Отмена'}
                                        />
                                    </MuiPickersUtilsProvider>
                                </div>
                            </FormLayoutGroup>
                            <div className="summ">
                                <h4>Сумма: </h4>
                                {this.getSum()}
                            </div>
                            <input type="hidden" name="group_id" value={id} />
                            {this.props.process}
                            <Button size="xl" disabled={this.state.disabled}>Забронировать</Button>
                        </FormLayout>
                    </List>
                }
            </Div>
        )
    }
}

const mapStateToProps = state => {
    return {
        found: state.channels.found,
        found_index: state.channels.found_index,
        token: state.app.token,
        process: state.app.process,
    };
};

const mapDispatchToProps = {
    buyStreamTime,
    searchChannels,
    getUserChannels,
    soldStreams,
    getPurchasedChannels,
    purchasedStreams
}

export default connect(mapStateToProps, mapDispatchToProps)(ListTranslations);
