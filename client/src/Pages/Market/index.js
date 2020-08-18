import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Div, FormLayout, FormLayoutGroup, Group, Input, Panel, ScreenSpinner, View } from '@vkontakte/vkui';
import { MuiPickersUtilsProvider, DateTimePicker } from 'material-ui-pickers';
import DateFnsUtils from "@date-io/date-fns";
import { getTime, getUnixTime } from 'date-fns';
import ruLocale from "date-fns/locale/ru";
import User from './../../components/User';
import PageHeader from './../../components/PageHeader';
import { searchChannels } from '../../actions';
import List from './ListTranslations';
import './main.scss';

class Market extends Component {
  constructor(props) {
    super(props);
    this.timeNow = new Date();
    this.state = {
      show: false,
      name: '',
      timeStart: this.timeNow,
      timeEnd: this.timeNow,
      // timeStart: moment(new Date()).hour(0).minute(0),
      // timeEnd: moment(new Date()).hour(23).minute(59),
      changed: false,
      minutesStep: 15,
    }
  }

  componentDidMount() {
    document.title = "Биржа";
  }

  searchTranslationClick = () => {
    this.setState({
      show: true,
    })
  };
  searchChannels = e => {
    e.preventDefault();
    if (this.props.token && this.formSearchChannels) {
      // const formData = new FormData(this.formSearchChannels);
      // formData.set('action', 'search');
      // formData.set('token', this.props.token);
      // if (this.state.changed) {
      //     formData.set('time_start', getUnixTime(this.state.timeStart));
      //     formData.set('time_end', getUnixTime(this.state.timeEnd));
      // }
      // if (this.state.name.trim() !== '') {
      //     formData.set('name', this.state.name);
      // }
      const formData = {
        action: 'search',
        token: this.props.token
      };
      if (this.state.changed) {
        formData.time_start = getUnixTime(this.state.timeStart);
        formData.time_end = getUnixTime(this.state.timeEnd);
      }
      if (this.state.name.trim() !== '') {
        formData.name = this.state.name;
      }
      this.props.searchChannels(this.props.token, formData)
        .then(this.setState({ show: true }));
    }
  };
  changeTimeStart = time => {
    if (getTime(this.state.timeEnd) <= getTime(time)) this.setState({ timeEnd: new Date(time.getTime() + 3600000) });
    this.setState({ timeStart: time });
    this.setState({ changed: true });
  };
  changeTimeEnd = time => {
    if (getTime(this.state.timeStart) >= getTime(time)) this.setState({ timeStart: new Date(time.getTime() - 3600000) });
    this.setState({ timeEnd: time });
    this.setState({ changed: true });
  };

  popout = {
    hidden: null,
    spinner: <ScreenSpinner />
  };

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
            <FormLayout onSubmit={this.searchChannels} getRef={v => this.formSearchChannels = v}>

              <Input
                className="search"
                type="text"
                onChange={e => this.setState({ name: e.target.value })}
                placeholder="Поиск по названию"
              />

              <FormLayoutGroup top="Выберите необходимый интервал" >
                <div className="date-time">
                  <MuiPickersUtilsProvider utils={DateFnsUtils} locale={ruLocale}>
                    <DateTimePicker
                      keyboard
                      ampm={false}
                      label="от"
                      onError={console.log}
                      minDate={this.timeNow}
                      value={this.state.timeStart}
                      onChange={this.changeTimeStart}
                      format={'dd.MM.yyyy HH:mm'}
                      disableOpenOnEnter
                      mask={[/\d/, /\d/, '.', /\d/, /\d/, '.', /\d/, /\d/, /\d/, /\d/, ' ', /\d/, /\d/, ':', /\d/, /\d/]}
                      minutesStep={this.state.minutesStep}
                      cancelLabel={'Отмена'}
                    />
                    <DateTimePicker
                      keyboard
                      ampm={false}
                      label="до"
                      onError={console.log}
                      minDate={this.timeNow}
                      value={this.state.timeEnd}
                      onChange={this.changeTimeEnd}
                      format={'dd.MM.yyyy HH:mm'}
                      disableOpenOnEnter
                      mask={[/\d/, /\d/, '.', /\d/, /\d/, '.', /\d/, /\d/, /\d/, /\d/, ' ', /\d/, /\d/, ':', /\d/, /\d/]}
                      minutesStep={this.state.minutesStep}
                      cancelLabel={'Отмена'}
                    />
                  </MuiPickersUtilsProvider>
                </div>
              </FormLayoutGroup>
              <Button size="xl">Показать</Button>
            </FormLayout>
          </Div>
          {this.state.show ? <List /> : null}
        </Group>
      </Panel>
    </View>
  }
}

const mapStateToProps = state => {
  return {
    token: state.app.token,
    user: state.app.user,
    popout: state.app.popout,
    activeTab: state.app.activeTab
  };
};

const mapDispatchToProps = {
  searchChannels
};

export default connect(mapStateToProps, mapDispatchToProps)(Market);
