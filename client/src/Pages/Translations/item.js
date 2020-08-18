import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import {Avatar, Button, Cell, Checkbox, Div, File, FormLayout, FormLayoutGroup, Input, List, Switch} from '@vkontakte/vkui';
import Icon24Cancel from '@vkontakte/icons/dist/24/cancel';
import Icon24Delete from '@vkontakte/icons/dist/24/delete';
import Icon24Attachments from '@vkontakte/icons/dist/24/attachments';
import { MuiPickersUtilsProvider, DateTimePicker } from 'material-ui-pickers';
import DateFnsUtils from "@date-io/date-fns";
import { getTime, getUnixTime, format } from 'date-fns';
import ruLocale from "date-fns/locale/ru";
import url from 'url';
import { addInfo, addUser, appState, channelState, deletePreview, enableBroadcast, getUserChannels, removeUser, saveChanges, setActiveTab, setPopup } from '../../actions';

class Channel extends Component {
  constructor(props) {
    super(props);
    this.timeNow = new Date();
    this.state = {
      isValidRtmpUrl: 'default',
      isValidRtmpKey: 'default',
      rtmp: props.data && props.data.rtmp ? props.data.rtmp : false,
      show: true,
      sell: props.data && props.data.sell ? props.data.sell : null,
      enabledForMe: props.data && props.data.active ? !!props.data.active : null,
      price:  props.data && props.data.price ? props.data.price : null,
      editAccess: false,
      users: {},
      error: {},
      disabled: false,
      vk_id: '',
      unlim: true,
      minutesStep: 15,
      timeStart: this.timeNow,
      timeEnd: this.timeNow,
      access: false,
      isValidLink: 'default',
      customChannelName: props.data && props.data.name ? this.props.data.name : ''
    }
  }

  showInfo = () => {
    this.props.updateData(this.props.id);
    this.props.channelState({ selectedType: this.props.type });
    this.props.setActiveTab('channel-settings');
    this.setState({
      show: !this.state.show
    })
  };

  componentWillMount() {
    if (!this.props.data) {
      this.props.setActiveTab('translations');
    }
  }

  changePrice = e => {
    this.setState({ price: e.target.value, disabled: false });
  };

  rtmpUrl = e => {
    // {
    //     "name": "2IDB6WpAf3Y",
    //     "domain": "stream3.vkuserlive.com",
    //     "port": 443,
    //     "query": "/live?srv=500727&s=aWQ9MklEQjZXcEFmM1kmc2lnbj1aa1o2a0RVMnlWczFWQ09RUG5DaW5RPT0="
    // }
    // hostname: "stream2.vkuserlive.com"
    // href: "rtmp://stream2.vkuserlive.com:443/live?srv=501713&s=aWQ9elFreVliVk5rMk0mc2lnbj1UZFdkK0tzYlJGSDA0a1VGeGpxQWZRPT0="
    // path: "/live?srv=501713&s=aWQ9elFreVliVk5rMk0mc2lnbj1UZFdkK0tzYlJGSDA0a1VGeGpxQWZRPT0="
    // pathname: "/live"
    // port: "443"
    // protocol: "rtmp:"
    // query: "srv=501713&s=aWQ9elFreVliVk5rMk0mc2lnbj1UZFdkK0tzYlJGSDA0a1VGeGpxQWZRPT0="
    // search: "?srv=501713&s=aWQ9elFreVliVk5rMk0mc2lnbj1UZFdkK0tzYlJGSDA0a1VGeGpxQWZRPT0="
    // slashes: true

    const rtmpUrl = url.parse(e.target.value);
    // if (rtmpUrl.hostname && rtmpUrl.port && rtmpUrl.path && rtmpUrl.protocol) {
    if (rtmpUrl.hostname && rtmpUrl.path && rtmpUrl.protocol) {
      const rtmp = {
        ...this.state.rtmp,
        domain: rtmpUrl.hostname,
        query: rtmpUrl.path
      };
      if (rtmpUrl.port) {
        rtmp.port = rtmpUrl.port;
      }
      // if (this.state.error && this.state.error.url) {
      //   const error = this.state.error;
      //   delete error.url;
      //   this.setState({ error });
      // }
      this.setState({
        rtmp,
        isValidRtmpUrl: 'valid'
      });
    } else {
      this.setState({
        isValidRtmpUrl: 'error',
        // error: {
        //   ...this.state.error,
        //   url: 'некорректный адрес rtmp-сервера'
        // }
      });
    }
  };

  rtmpKey = e => {
    if (e.target.value.trim() !== '') {
      const rtmp = {
        ...this.state.rtmp,
        name: e.target.value
      };
      // if (this.state.error && this.state.error.key) {
      //   const error = this.state.error;
      //   delete error.key;
      //   this.setState({ error });
      // }
      this.setState({
        rtmp,
        isValidRtmpKey: 'valid'
      });
    } else {
      this.setState({
        isValidRtmpKey: 'error',
        // error: {
        //   ...this.state.error,
        //   key: 'укажите ключ в поле KEY'
        // }
      });
    }
  };

  saveChanges = () => {
    if (this.props.id) {
      const formData = {
        group_id: this.props.id,
        price: this.state.price ? this.state.price : 0,
        sell: this.state.sell ? 1 : 0,
        action: 'update'
      };
      if (this.state.rtmp) formData.rtmp = JSON.stringify(this.state.rtmp);
      if (this.props.data.name !== this.state.customChannelName) {
        formData.name = this.state.customChannelName;
      }
      this.setState({ disabled: true });
      this.props.saveChanges(formData)
        .then(({ type }) => {
          if (type === 'POPUP_SUCCESS') {
            this.props.getUserChannels();
            //this.props.setPopup('success');
          } //else this.props.setPopup('failure');
        });
    }
  };

  enableBroadcast = e => {

    e.stopPropagation();

    const { type, rtmp, active } = this.props.data;

    if(!active && !this.props.tariff) {
      this.props.paymentPopup();
      this.props.appState({ popout: 'confirm' });
    }
    else if (this.props.id && ((this.props.numActiveChannels < this.props.tariff.amount && +active === 0) || +active === 1)) {
      if (type && (type === 'vk' || type === 'custom') && !rtmp) {
        if (this.props.type && this.props.type === 'owner') this.props.rtmpError('owner');
        if (this.props.type && this.props.type === 'shared') this.props.rtmpError('shared');
      } else {
        console.log('enableBroadcast');
        const formData = {
          group_id: this.props.id,
          broadcast: +!active,
          owner: this.props.type
        };
        this.props.enableBroadcast(formData)
          .then(status => {
            // if (status) this.setState({ enabledForMe: !!this.props.data.active });
            // if (status) this.setState({ enabledForMe: !this.state.enabledForMe });
          });
      }
    } else if(this.props.numActiveChannels >= this.props.tariff.amount && +active === 0) {
      this.props.paymentPopup();
      // this.props.appState({
      //   popup: {
      //     msg: 'Достигнут лимит количества активных каналов на оплаченном тарифе!',
      //     type: false
      //   }
      // });
      this.props.appState({ popout: 'confirm' });
    }
  };

  deleteChannel = () => {
    if (this.props.id && this.props.token) {
      this.props.deleteChannel(this.props.token, this.props.id)
        .then(({ type }) => {
          if (type === 'SUCCESS') this.props.getUserChannels();
        });
    }
    this.setState({
      show: !this.state.show
    })
  };

  // editAccess = () => {
  //   this.setState({
  //     editAccess: !this.state.editAccess
  //   })
  // };
  //
  // backClick = () => {
  //   this.setState({
  //     editAccess: !this.state.editAccess
  //   })
  // };

  changeTimeStart = time => {
    if (getTime(this.state.timeEnd) <= getTime(time)) this.setState({ timeEnd: new Date(time.getTime() + 3600000) });
    this.setState({
      timeStart: time,
      access: false
    });
  };

  changeTimeEnd = time => {
    if (getTime(this.state.timeStart) >= getTime(time)) this.setState({ timeStart: new Date(time.getTime() - 3600000) });
    this.setState({
      timeEnd: time,
      access: false
    });
  };

  addUser = () => {
    const formData = {
      access: 'add'
    };
    if (this.props.id && this.state.vk_id) {
      const urlParts = url.parse(this.state.vk_id).pathname.split('/');
      formData.group_id = this.props.id;
      formData.vk_id = urlParts.length === 1 ? urlParts[0] : urlParts[1];
      if (!this.state.unlim && this.state.timeEnd > this.state.timeStart) {
        formData.time_start = getUnixTime(this.state.timeStart);
        formData.time_end = getUnixTime(this.state.timeEnd);
      }
      this.setState({ access: true });
      this.props.addUser(formData)
        .then(status => {
          if (status) this.setState({
            access: false,
            vk_id: ''
          });
        });
    }
  };

  addInfo = (e) => {
    e.preventDefault();
    if (this.infoForm && this.props.id) {
      const formData = new FormData(this.infoForm);
      formData.append('group_id', this.props.id);
      formData.append('action', 'update');
      this.props.addInfo(formData)
        .then(({ type }) => {
          if (type === 'POPUP_SUCCESS') this.props.getUserChannels();
        });
    }
  };

  deletePreview = (e) => {
    e.stopPropagation();
    if (this.props.id) {
      this.props.deletePreview(this.props.id)
        .then(({ type }) => {
          if (type === 'POPUP_SUCCESS') this.props.getUserChannels();
        });
    }
  };


  render() {

    const channel = this.props.data || {};
    let rtmpUrl = false;
    let rtmpKey = false;
    if (channel.rtmp) {
      const rtmp = channel.rtmp;
      if (rtmp.domain) {
        rtmpUrl = `rtmp://${rtmp.domain}${rtmp.port ? ':' + rtmp.port : ''}${rtmp.query}`;
      }
      if (rtmp.name) rtmpKey = rtmp.name;
    }
    const { timeStart, timeEnd, minutesStep, customChannelName } = this.state;
    const { activeTab, setActiveTab, appState } = this.props;

    const channelStatus = <span
      className={`status ${channel.live ? 'live' : 'offline'}`}
      title={channel.live ? 'Идет трансляция' : 'Offline'}
    />;

    if (this.props.titleOnly) {
      return(
        <Cell
          before={<Avatar size={40} src={channel.photo} />}
          onClick={this.showInfo}
          size="l"
          bottomContent={channel.service}
        >
          {channelStatus} {channel.name}
        </Cell>
      );
    } else {
      return <Fragment>
        {this.props.type === 'owner' || this.props.type === 'shared' ?
          <List>
            <div>
              {/*{this.state.show && !this.state.editAccess ?*/}
              {this.state.show ?
                <div>
                  <Cell onClick={() => { if(channel.type === 'vk') window.open(`https://vk.com/club${channel.id}`, "_blank") }}
                    before={<Avatar size={40} src={channel.photo} />}
                    size="l"
                    bottomContent={channel.service}
                  >
                    {channelStatus} {channel.name}
                  </Cell>
                  <Cell>
                    {this.props.type === 'owner' ?
                      <Div className="trnslatSet">
                        {/* <Checkbox
                              defaultChecked={this.state.sell}
                              onChange={() => this.setState({ sell: !this.state.sell, disabled: false })}
                              className="stvi-font--small"
                          >
                              Продавать время на бирже
                          </Checkbox>
                          <Input
                              placeholder="Цена, руб/час"
                              value={String(this.state.price)}
                              onChange={this.changePrice}
                          /> */}
                        {channel.type && (channel.type === 'vk' || channel.type === 'ok' || channel.type === 'custom') ?
                          <div>
                            <div className="title-wrapper">
                                <span className="trnslatSet-title">Настройки трансляции</span>
                                <span className="trnslatSet-title"><Icon24Delete onClick={() => this.props.deleteChannel(this.props.id)}/></span>
                            </div>
                            <FormLayout>
                              {channel.type === 'custom' || channel.type === 'ok' ?
                                <Input
                                  top='Название канала'
                                  placeholder='Название'
                                  onChange={e => this.setState({
                                    customChannelName: e.target.value,
                                    disabled: false
                                  })}
                                  defaultValue={customChannelName}
                                />
                                : null}
                              <Input
                                top='Адрес сервера'
                                placeholder="RTMP URL"
                                defaultValue={rtmpUrl ? rtmpUrl : null}
                                onChange={this.rtmpUrl}
                                status={this.state.isValidRtmpUrl}
                                bottom={this.state.isValidRtmpUrl === 'error' ? 'Некорректный адрес rtmp-сервера' : null}
                                type='text'
                              />
                              <Input
                                top='Ключ трансляции'
                                placeholder="RTMP KEY"
                                onChange={this.rtmpKey}
                                defaultValue={rtmpKey ? rtmpKey : null}
                                status={this.state.isValidRtmpKey}
                                bottom={this.state.isValidRtmpKey === 'error' ? 'Укажите ключ трансляции' : null}
                                type='text'
                              />
                            </FormLayout>
                            <Div style={{ display: 'flex', justifyContent: 'center', paddingTop: '0px' }}>
                              <Button
                                size="l"
                                stretched
                                style={{ maxWidth: '200px', paddingTop: '0px' }}
                                onClick={this.saveChanges}
                                disabled={this.state.disabled || this.state.isValidRtmpUrl !== 'valid' || this.state.isValidRtmpKey !== 'valid'}
                                className="stvi-btn-main"
                              >
                                Сохранить
                              </Button>
                            </Div>
                          </div>
                          :
                          <div>
                            <div className="title-wrapper">
                              <span className="trnslatSet-title">Удалить</span>
                              <span className="trnslatSet-title"><Icon24Delete onClick={() => this.props.deleteChannel(this.props.id)}/></span>
                            </div>
                            {channel.type && channel.type === 'youtube' ?
                              <Fragment>
                                <FormLayout
                                  onSubmit={e => this.addInfo(e)}
                                  getRef={v => this.infoForm = v}
                                >
                                  <Input
                                    top='Название трансляции'
                                    name="title"
                                    placeholder="Заголовок видео на Youtube"
                                    type='text'
                                    defaultValue={channel.title ? channel.title : ''}
                                    onChange={() => this.setState({ disabled: false })}
                                  />
                                  {/*channel.preview ?
                                    <Cell
                                      className="preview-image"
                                      before={<img src={`/upload/thumbnails/${channel.preview}`} alt="preview" />}
                                      asideContent={<Icon24Delete onClick={this.deletePreview}/>}>
                                    </Cell>
                                    :
                                    <File
                                      name="preview"
                                      before={<Icon24Attachments />}
                                      size="l"
                                      children='Добавить превью'
                                      onClick={() => this.setState({ disabled: false })}
                                    />
                                  */}
                                  <Div style={{ display: 'flex', justifyContent: 'center', paddingTop: '0px' }}>
                                    <Button
                                      size="l"
                                      stretched
                                      style={{ maxWidth: '200px', paddingTop: '0px' }}
                                      disabled={this.state.disabled}
                                      className="stvi-btn-main"
                                    >
                                      Сохранить
                                  </Button>
                                  </Div>
                                </FormLayout>
                              </Fragment>
                              : null}
                          </div>
                        }
                        {/*<Button
                              level="outline"
                              onClick={() => {
                                if(!this.props.tariff){
                                  appState({ popout: 'popup', popup: {msg: 'Невозможно на бесплатном тарифе', type: false}});
                                } else {
                                  this.editAccess();
                                }
                              }}
                            >Настроить доступ</Button>*/}
                        {this.props.process}
                      </Div>
                      : channel.sharedTime ?
                        <Fragment>
                          <span className="shared-time-title">Доступное время:</span>
                          {channel.sharedTime.unlim ?
                            <span style={{ display: 'block', color: 'green' }}>неограниченно</span>
                            :
                            <div className="shared-time">
                              <span>
                                {format(channel.sharedTime.start * 1000, 'dd.MM.yyyy HH:mm')}
                              </span>
                              &nbsp;&nbsp;-&nbsp;&nbsp;
                              <span>
                                {format(channel.sharedTime.end * 1000, 'dd.MM.yyyy HH:mm')}
                              </span>
                            </div>
                          }
                        </Fragment>
                        : null}
                    <Div
                      style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
                    >
                      <Switch
                        checked={!!channel.active}
                        onChange={this.enableBroadcast}
                      />
                      <span style={{ marginLeft: "15px" }}>Транслировать</span>
                    </Div>
                  </Cell>
                </div> : null}
            </div>

            {this.props.tariff && this.props.type === 'owner' ?
              <div>
                <Cell multiline>
                  <Div className="translation__item-header">
                    <span>Выдача доступа</span>
                    {/*<Button onClick={this.backClick} level="tertiary"><Icon24Cancel /></Button>*/}
                  </Div>
                  <FormLayout>
                    <Input
                      onChange={e => {
                        const isValidLink = e.target.value.search(/https:\/\/vk\.com\/[_\-\d\w]+/i) !== -1 ? 'valid' : 'error';
                        this.setState({ vk_id: e.target.value, access: false, isValidLink })
                      }}
                      type="text"
                      placeholder="Ссылка на профиль Вконтакте"
                      value={this.state.vk_id ? this.state.vk_id : ''}
                      status={this.state.isValidLink}
                      bottom={this.state.isValidLink === 'error' ? 'Некорректный адрес профиля' : null}
                    />
                    <Checkbox
                      defaultChecked={!this.state.unlim}
                      onChange={() => this.setState({ unlim: !this.state.unlim })}
                    >Время</Checkbox>
                    {this.state.unlim ? null : <div className="date-time">
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
                    </div>}
                    <Button
                      disabled={this.state.access || this.state.isValidLink !== 'valid'}
                      onClick={ e => {
                        e.preventDefault();
                        this.addUser();
                      }}
                      level="outline"
                    >Добавить</Button>
                  </FormLayout>
                  {channel.users ? channel.users.map((user, index) => <Cell
                    before={<Avatar size={40} src={user.photo} />}
                    key={index}
                    removable
                    bottomContent={user.time_start && user.time_end ?
                      format(user.time_start * 1000, 'dd.MM.yyyy HH:mm') + " — " + format(user.time_end * 1000, 'dd.MM.yyyy HH:mm')
                      : 'время не ограничено'}
                    size="l"
                    onRemove={() => this.props.removeUser(user.user_id, this.props.id)}>
                    {user.name + " " + user.surname}
                  </Cell>) : null}
                </Cell>
              </div> : null}
          </List>
          :
          <List>
            {this.state.show ?
              <div>
                {channel.time ?
                  <Cell className="content">
                    {this.props.type === 'available' ?
                      <span style={{ display: 'block', color: 'red' }}>Недоступное для покупки время:</span>
                      :
                      <span style={{ display: 'block', color: 'green' }}>Оплаченное время:</span>
                    }
                    {channel.time.map((item, i) => <div key={i} style={this.props.type === 'available' ? { color: 'red' } : { color: 'green' }}>
                      {format(item.start * 1000, 'dd.MM.yyyy HH:mm')}
                      &nbsp;&nbsp;-&nbsp;&nbsp;
                      {format(item.end * 1000, 'dd.MM.yyyy HH:mm')}
                    </div>)}
                  </Cell>
                  : null }
              </div>
              : null}
          </List>
        }
      </Fragment>;
    }
  }
}

const mapStateToProps = state => {
  return {
    token: state.app.token,
    process: state.app.process,
    tariff: state.tariffs.tariff,
    numActiveChannels: state.channels.numActiveChannels
  };
};

const mapDispatchToProps = {
  addInfo,
  addUser,
  appState,
  channelState,
  deletePreview,
  enableBroadcast,
  getUserChannels,
  removeUser,
  saveChanges,
  setActiveTab,
  setPopup
};

export default connect(mapStateToProps, mapDispatchToProps)(Channel);
