import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Alert, Avatar, Button, Div, FormLayout, HeaderButton, Input, Group, Panel, PanelHeader, PopoutWrapper, ScreenSpinner, Select, View, List, Cell } from '@vkontakte/vkui';
import Icon24BrowserBack from '@vkontakte/icons/dist/24/browser_back';
import Icon24BrowserForward from '@vkontakte/icons/dist/24/browser_forward';
import Icon24Add from '@vkontakte/icons/dist/24/add';

import { authRequest } from '../../utils/requests';
import url from 'url';
import Icon24Copy from '@vkontakte/icons/dist/24/copy';
import CopyToClipboard from 'react-copy-to-clipboard';

import PageHeader from './../../components/PageHeader';
import { appState, deleteChannel, getUserChannels, getAvailableChannels, setPopup, setActiveTab, addCustomRtmp, channelState, updateStreamKey } from '../../actions';
import { OAuth } from '../../utils/googleoauth';
import { OAuth2 } from '../../utils/authorization';
import confirmPopup from '../../components/Popup/index';

import Channel from './item';

import './main.scss'

class Translations extends Component {

  constructor(props) {
    super(props);

    this.state = {
      display: 'all',
      channelId: false,
      channelType: false,
      type: {
        vk: {
          name: 'Вконтакте',
          logo: '/app/img/logo/vk.png',
          active: true
        },
        youtube: {
          name: 'YouTube',
          logo: '/app/img/logo/youtube.png',
          active: true
        },
        fb: {
          name: 'Facebook',
          logo: '/app/img/logo/fb.png'
        },
        ok: {
          name: 'Одноклассники',
          logo: '/app/img/logo/ok.png'
        },
        twitch: {
          name: 'Twitch',
          logo: '/app/img/logo/twitch.png',
          active: true
        },
        custom: {
          name: 'Свой RTMP-сервер',
          logo: '/app/img/logo/custom.png'
        }
      },
      rtmpColsd: true,
      owner: 'owner'
    };
  }

  componentDidMount() {
    document.title = "Трансляции";

    if (this.props.pathname) {
      if (this.props.pathname === '/groups' && !this.state.channelType) {
        this.props.setActiveTab('services');
      }
      if(this.props.pathname === '/channel-settings' && !this.state.channelId){
        this.props.setActiveTab('translations');
      }
    }
  }

  updateData = value => {
    this.setState({ channelId: value })
  };


  popout = () => {
    let msg, type;
    if(this.props.popup){
      msg = this.props.popup.msg;
      type = this.props.popup.type;
    }
    switch (this.props.popout) {
      case 'hidden':
        return null;
      case 'spinner':
        return <ScreenSpinner />;
      case 'success':
        return this.resultPopup(true);
      case 'failure':
        return this.resultPopup();
      case 'owner':
        return this.rtmpError('owner');
      case 'shared':
        return this.rtmpError('shared');
      case 'popup':
        return this.popup(msg, type);
      case 'copied':
        return this.copied();
      case 'confirm':
        return confirmPopup(
          this.popupMsg,
          this.confirmFn,
          () => this.props.setPopup('hidden')
        );
      default:
        return null;
    }
  };

  // deleteChannelPopup = (delFn) => {
  //   this.delMsg = 'Действительно хотите отключить канал?';
  //   this.delFn = delFn;
  //   this.props.setPopup('confirm');
  // };

  deleteChannel = (id) => {
    this.popupMsg = 'Действительно хотите отключить канал?';
    this.confirmFn = () => {
      return this.props.deleteChannel(this.props.token, id)
        .then(({ type }) => {
          if (type === 'SUCCESS') {
            this.props.getUserChannels()
              .then(() => {
                this.props.setActiveTab('translations');
                this.props.setPopup('hidden');
              });
          }
        });
    };
    this.props.setPopup('confirm');
  };

  paymentPopup = () => {
    this.popupMsg = 'Достигнут лимит количества активных каналов! Желаете изменить тариф?';
    this.confirmFn = () => this.props.setActiveTab('balance', '/balance/tariff');
    this.props.setPopup('confirm');
  };


  resultPopup = (msg = false) => {
    setTimeout(() => this.props.setPopup('hidden'), 2000);
    return <Alert onClose={() => this.props.setPopup('hidden')}>
      <Div style={msg ? { color: 'green' } : { color: 'red' }}>
        {msg ? 'Успешно!' : 'Что-то пошло не так ☹'}
      </Div>
    </Alert>
  };

  copied = () => {
    setTimeout(() => this.props.setPopup('hidden'), 2000);
    return <Alert onClose={() => this.props.setPopup('hidden')}>
      <Div style={{ color: 'green' }}>
        {'Скопировано!'}
      </Div>
    </Alert>
  };

  popup = (msg, type = true) => {
    const { appState } = this.props;
    setTimeout(() => appState({ popout: 'hidden' }), 2000);
    return <Alert onClose={() => appState({ popout: 'hidden' })}>
      <Div style={{ color: type ? 'green' : 'red', textAlign: 'center' }}>
        {msg}
      </Div>
    </Alert>
  };

  rtmpError = type => {
    const msg = {
      owner: 'Укажите настройки rtmp-сервера!',
      shared: 'Владелец канала не указал настройки rtmp-сервера, трансляция невозможна!'
    };
    setTimeout(() => this.props.setPopup('hidden'), 5000);
    return <Alert onClose={() => this.props.setPopup('hidden')}>
      <Div style={{ color: 'red' }}>
        {msg[type]}
      </Div>
    </Alert>
  };

  getChannel = () => {
    if (this.props.token) {
      this.props.getUserChannels();
        // .then(this.openChannelSetting());
      this.props.getAvailableChannels();
    }
  };

  authorize = () => {
    const { channelType } = this.state;

    if (channelType && channelType !== 'vk') {
      OAuth2(channelType)
        .then(this.getChannel);
    }
  };

  // openChannelSetting = () => {
  //   this.props.setActiveTab('channel-settings');
  //   this.props.channelState({ addedChannelId: false });
  //   console.log(this.props.addedChannelId);
  //   if(this.props.addedChannelId){
  //     this.setState(
  //       { channelId: this.props.addedChannelId },
  //       () => {
  //         this.props.setActiveTab('channel-settings');
  //         this.props.channelState({ addedChannelId: false });
  //       }
  //     );
  //   }
  // };

  addUserGroup = (authorize = false) => {
    if (this.props.token) {
      if (this.state.channelType) {
        let channelId = this.state.channelId ? this.state.channelId : '';
        console.log('this.state.channelId', this.state.channelId);
        if (!authorize) {
          // if (!!channelId) {
          //   const urlParts = url.parse(channelId).pathname.split('/');
          //   channelId = urlParts.length === 1 ? urlParts[0] : urlParts[1];
          // }
          authRequest({
            method: 'GET',//todo change to POST
            url: `${window.location.protocol}//${window.location.host}/api/channel/add`,
            token: this.props.token,
            body: { type: this.state.channelType, channelId, token: this.props.token }//todo delete token
          }).then(() => {
            this.props.getUserChannels()
              .then(() => {
                this.props.setActiveTab('channel-settings');
                this.props.channelState({ addedChannelId: false });
              });
          });
        } else if (this.state.channelType === 'youtube') {
          if (!!channelId) {
            const urlParts = url.parse(channelId).pathname.split('/');
            channelId = urlParts.length === 1 ? urlParts[0] : urlParts[2];
          }
          OAuth({ channelId, getChannel: this.getChannel });
          // if (channel === '') {
          // 	OAuth({ channel: '', getChannel: this.getChannel });
          // } else {
          // 	OAuth({ channel: url.parse(channel).pathname.substring(9), getChannel: this.getChannel });
          // }
        }
      }
      // this.setState({
      //   channelId: false,
      //   channelType: false
      // });
    }
  };

  displayChannels = (type = 'all') => {

    switch (type) {
      case 'owner':
        return this.props.owner_index.length > 0 ? <Fragment>
          {this.props.owner_index
            .filter(id => !!this.props.owner[id].live)
            .map(i => <Group
            key={i}
            title=''
            className="group-block"
          >
            <Channel
              key={i}
              id={i}
              type='owner'
              data={this.props.owner[i]}
              updateData={this.updateData}
              titleOnly
            />
          </Group>)}
          {this.props.owner_index
            .filter(id => !this.props.owner[id].live)
            .map(i => <Group
            key={i}
            title=''
            className="group-block"
          >
            <Channel
              key={i}
              id={i}
              type='owner'
              data={this.props.owner[i]}
              updateData={this.updateData}
              titleOnly
            />
          </Group>)}
        </Fragment> : <Cell>Вы не добавили ни одного канала</Cell>;
      case 'shared':
        return this.props.shared_index.length > 0 ? this.props.shared_index.map(i => <Group
          key={i}
          title=''
          className="group-block"
        >
          <Channel
            key={i}
            id={i}
            type='shared'
            data={this.props.shared[i]}
            updateData={this.updateData}
            titleOnly
          />
        </Group>) : <Div>Похоже нет каналов с предоставленным доступом</Div>;
      case 'purchased':
        return this.props.purchased_index.length > 0 ? this.props.purchased_index.map(i => <Group
          key={i}
          title=''
          className="group-block">
          <Channel
            key={i}
            type='purchased'
            data={this.props.purchased[i]}
            id={i}
          />
        </Group>) : <Div>Оплаченных каналов нет</Div>;
      case 'all':
        return <Fragment>
          {this.props.owner_index
            .filter(id => this.props.owner[id].live)
            .map(i => <Group
              key={i}
              title=''
              className="group-block"
            >
              <Channel
                key={i}
                id={i}
                type='owner'
                data={this.props.owner[i]}
                updateData={this.updateData}
                titleOnly
              />
            </Group>)}
          {this.props.shared_index
            .filter(id => this.props.shared[id].live)
            .map(i => <Group
            key={i}
            title=''
            className="group-block">
            <Channel
              key={i}
              id={i}
              type='shared'
              data={this.props.shared[i]}
              titleOnly
              updateData={this.updateData}
            />
          </Group>)}
          {this.props.owner_index
            .filter(id => !this.props.owner[id].live)
            .map(i => <Group
            key={i}
            title=''
            className="group-block">
            <Channel
              key={i}
              id={i}
              type='owner'
              data={this.props.owner[i]}
              updateData={this.updateData}
              titleOnly
            />
          </Group>)}
          {this.props.shared_index
            .filter(id => !this.props.shared[id].live)
            .map(i => <Group
            key={i}
            title=''
            className="group-block">
            <Channel
              key={i}
              id={i}
              type='shared'
              data={this.props.shared[i]}
              titleOnly
              updateData={this.updateData}
            />
          </Group>)}
          {this.props.purchased_index.map(i => <Group
            key={i}
            title=''
            className="group-block">
              <Channel
                key={i}
                type='purchased'
                data={this.props.purchased[i]}
                id={i}
              />
          </Group>)}
        </Fragment>;
      default:
        return <Cell>Выберите из выпадающего списка</Cell>;
    }
  };

  rtmpColsdHandler = () => {
    this.setState({
      rtmpColsd: !this.state.rtmpColsd
    });
  };

  render() {

    const { activeTab, setActiveTab, disabled, disabled_index, isMobile, updateStreamKey } = this.props;

    const selectedType = this.props.selectedType ? this.props.selectedType : 'owner';

    const { channelType } = this.state;

    let mainStyles = {
      paddingTop: (isMobile ? 10 : 60),
      paddingBottom: 60,
      color: 'gray'
    };

    return <View
      activePanel={activeTab}
      popout={this.popout()}
    >
      <Panel id='translations'>
        <PageHeader />
        <Group
          style={mainStyles}
          className={activeTab}
        >
          <List>
            {this.props.user.rtmp ?
              <Cell>
                <Group className={this.state.rtmpColsd ? 'rtmp-wrapper collapsed' : 'rtmp-wrapper'}
                       onClick={this.rtmpColsdHandler}>
                  <div className="rtmp-wrapper__title">
                    <span className="title">Настройки rtmp-сервера</span>
                    <Icon24BrowserForward />
                  </div>




                  <Div
                    className='input-copy'
                  >
                    <Div className='input-copy__title'>
                      <span>rtmp-сервер для трансляции</span>
                    </Div>
                    <Div className="input-copy__data"> 
                      <Input
                        disabled
                        value={this.props.user.rtmp.url}
                      />
                      <CopyToClipboard
                        className="input-copy__icon"
                        text={this.props.user.rtmp.url}
                        onCopy={() => this.props.setPopup('copied')}>
                        <Icon24Copy
                          onClick={(e) => e.stopPropagation()}
                        />
                      </CopyToClipboard>
                    </Div>
                  </Div>


                  <Div
                    className="input-copy"
                  >
                    <Div className='input-copy__title'>
                      <span>Ключ</span>
                      <Button className="get-new-key__button"
                              onClick={(e) => { e.stopPropagation(); updateStreamKey();}}
                              level="tertiary"
                      >
                        сгенерировать новый
                      </Button>
                    </Div>
                    <Div className="input-copy__data">
                      <Input
                        disabled
                        value={this.props.user.rtmp.name}
                      />
                      <CopyToClipboard
                        className="input-copy__icon"
                        text={this.props.user.rtmp.name}
                        onCopy={() => this.props.setPopup('copied')}>
                        <Icon24Copy
                          onClick={(e) => e.stopPropagation()}
                        />
                      </CopyToClipboard>  
                    </Div>
                  </Div>




                </Group>
              </Cell>
              : null}
            <Cell>
              <Group
                className='channels'
                title={<Fragment>
                <div>Каналы</div>
                  <div className="select-channel__wrapper">
                    <Select
                      defaultValue={ this.state.display }
                      onChange={ e => this.setState({ display: e.target.value }) }
                    >
                      <option value="all">все</option>
                      <option value="owner">мои</option>
                      <option value="shared">доступные</option>
                      <option value="purchased">приобретенные</option>
                    </Select>
                    <Button className="add-channel__button" level="tertiary" onClick={() => {
                      setActiveTab('services');
                    }}><Icon24Add /></Button>
                  </div>
              </Fragment>}>
                {this.props.loaded ? this.displayChannels(this.state.display) : null}
              </Group>
            </Cell>
          </List>
        </Group>
      </Panel>
      <Panel id='services'>
        <PanelHeader
          theme='alternate'
          left={<HeaderButton
            onClick={() => setActiveTab('translations')}
          >
            <Icon24BrowserBack />
          </HeaderButton>}
          addon={<HeaderButton onClick={() => setActiveTab('translations')}>Назад</HeaderButton>}
        >
          Выберите сервис
        </PanelHeader>
        <Group
          style={{
            paddingTop: 10,
            paddingBottom: 10,
            color: 'gray',
            height: '-webkit-fill-available'
          }}
          className={activeTab}
        >
          <List>
            <Div>
              <Group title="Доступные сервисы">
                <List>
                  {Object.keys(this.state.type).map((type, i) => {
                    return <Cell
                      key={i}
                      before={<Avatar type="app" src={this.state.type[type].logo} />}
                      multiline={false}
                      onClick={() => {
                        this.setState({ channelType: type });
                        setActiveTab('groups');
                      }}
                    >{this.state.type[type].name}</Cell>
                  })}
                </List>
              </Group>
            </Div>
          </List>
        </Group>
      </Panel>
      <Panel id='groups'>
        <PanelHeader
          theme='alternate'
          left={<HeaderButton
            onClick={() => setActiveTab('services')}
          >
            <Icon24BrowserBack />
          </HeaderButton>}
          addon={<HeaderButton onClick={() => setActiveTab('services')}>Назад</HeaderButton>}
        >
          {channelType === 'custom' || channelType === 'ok' ? 'Укажите настройки нового канала' : 'Выберите группу'}
        </PanelHeader>
        <Group
          style={{
            paddingTop: 10,
            paddingBottom: 10,
            color: 'gray'
          }}
          className={activeTab}
        >
          <List>
            <Div>
              {channelType && (channelType === 'custom' || channelType === 'ok') ?
                <CustomRTMP
                  channelType={channelType}
                  updateData={this.updateData}
                />
                : <Group title={channelType ?
                  `Доступные каналы/группы ${this.state.type[channelType].name}`
                  : 'Доступные каналы/группы'
                }>
                  <List>
                    {(
                      channelType &&
                      disabled_index[channelType] &&
                      disabled_index[channelType].length > 0
                    ) ? disabled_index[channelType].map(i => {
                        return <Cell
                          key={i}
                          before={<Avatar type="app" src={disabled[i].photo} />}
                          multiline={false}
                          onClick={() => {
                            this.setState(
                              { channelId: i },
                              this.addUserGroup
                            );
                          }}
                        >{disabled[i].name}</Cell>
                      })
                      : channelType && !this.props.user.token[channelType] ?
                        <Div><Button
                          // onClick={() => this.addUserGroup(true)}
                          onClick={this.authorize}
                          disabled={!this.state.type[channelType].active}
                        >Авторизовать в {this.state.type[channelType].name}</Button></Div>
                        : !channelType ? null : <Div>Нет каналов для добавления</Div>}
                  </List>
                </Group>}
            </Div>
          </List>
        </Group>
      </Panel>
      <Panel id='channel-settings'>
        <PanelHeader
          theme='alternate'
          left={<HeaderButton onClick={() => setActiveTab('translations')}><Icon24BrowserBack /></HeaderButton>}
        >
          Настройки канала
        </PanelHeader>
        <Channel
          key={this.state.channelId}
          id={this.state.channelId}
          type={selectedType}
          data={this.props[selectedType][this.state.channelId]}
          updateData={this.updateData}
          deleteChannel={this.deleteChannel}
          paymentPopup={this.paymentPopup}
          rtmpError={this.props.setPopup}
        />
      </Panel>
    </View>
  }
}


const mapStateToProps = state => {
  return {
    token: state.app.token,
    user: state.app.user,
    activePanel: state.app.activePanel,
    activeTab: state.app.activeTab,
    popout: state.app.popout,
    popup: state.app.popup,
    owner: state.channels.owner,
    owner_index: state.channels.owner_index,
    addedChannelId: state.channels.addedChannelId,
    shared: state.channels.shared,
    shared_index: state.channels.shared_index,
    disabled: state.channels.disabled,
    disabled_index: state.channels.disabled_index,
    available: state.channels.available,
    available_index: state.channels.available_index,
    purchased: state.channels.purchased,
    purchased_index: state.channels.purchased_index,
    loaded: state.channels.loaded,
    pathname: state.router.location.pathname,
    isMobile: state.app.isMobile,
    selectedType: state.channels.selectedType
  };
};

const mapDispatchToProps = {
  appState,
  deleteChannel,
  setPopup,
  getUserChannels,
  getAvailableChannels,
  setActiveTab,
  channelState,
  updateStreamKey
};

export default connect(mapStateToProps, mapDispatchToProps)(Translations);

class CustomRtmpComponent extends Component {

  constructor(props) {
    super(props);
    this.state = {
      rtmp: '',
      rtmpStatus: 'default',
      key: '',
      keyStatus: 'default',
      name: '',
      typeName: props.channelType ? props.channelType === 'ok' ? 'Одноклассники' : 'Свой RTMP-сервер' : 'Свой RTMP-сервер',
      type: props.channelType ? props.channelType : 'custom'
    };
  }

  setRtmp = e => {
    const rtmp = e.target.value.trim();
    this.setState({ rtmp });
    if (rtmp.match(/^rtmp:\/\/[\S]+\/[\S]*$/i)) {
      this.setState({ rtmpStatus: 'valid' });
    } else {
      this.setState({ rtmpStatus: 'error' });
    }
  };

  setKey = e => {
    const rtmpKey = e.target.value.trim();
    this.setState({ key: rtmpKey });
    if (rtmpKey.trim() !== '') {
      this.setState({ keyStatus: 'valid' });
    } else {
      this.setState({ keyStatus: 'error' });
    }
  };

  addCustomRtmp = () => {
    const { type } = this.state;
    if (this.state.rtmpStatus === 'valid' && this.state.rtmpStatus !== 'error') {
      const rtmpUrl = url.parse(this.state.rtmp);
      let rtmp = {};
      if (rtmpUrl.hostname) rtmp.domain = rtmpUrl.hostname;
      if (rtmpUrl.port) rtmp.port = rtmpUrl.port;
      if (rtmpUrl.path) rtmp.query = rtmpUrl.path;
      rtmp.name = this.state.key;
      let data = { rtmp, type };
      if (this.state.name.trim() !== '') data.name = this.state.name.trim();
      this.props.addCustomRtmp(data)
        .then(() => {
          const { addedChannelId, channelState, setActiveTab, updateData } = this.props;
          if(addedChannelId){
            updateData(addedChannelId);
            setActiveTab('channel-settings');
            channelState({ addedChannelId: false })
          } else {
            setActiveTab('translations');
          }
        });
    }
  };

  render() {
    return (
      <Group title={this.state.typeName}>
        <FormLayout>
          <Input
            top="Название"
            value={this.state.name}
            placeholder='будет отображаться в списке ваших каналов'
            onChange={e => this.setState({ name: e.target.value })}
          />
          <Input
            top="rtmp-сервер для трансляции"
            value={this.state.rtmp}
            placeholder='Адрес сервера'
            onChange={this.setRtmp}
            status={this.state.rtmpStatus}
            bottom={this.state.rtmpStatus === 'error' ? 'Укажите корректный адрес rtmp-сервера' : null}
          />
          <Input
            value={this.state.key}
            placeholder='Ключ'
            onChange={this.setKey}
            status={this.state.keyStatus}
            bottom={this.state.keyStatus === 'error' ? 'Укажите корректный ключ' : null}
          />
          <Button
            onClick={this.addCustomRtmp}
            disabled={!(this.state.rtmpStatus === 'valid' && this.state.keyStatus === 'valid')}
          >Добавить</Button>
        </FormLayout>
      </Group>
    );
  }
}

const CustomRTMP = connect(
  (state) => {
    return {
      addedChannelId: state.channels.addedChannelId
    };
  },
  {
    addCustomRtmp,
    setActiveTab,
    channelState
  }
)(CustomRtmpComponent);
