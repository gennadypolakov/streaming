import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Alert, Avatar, Button, Cell, Checkbox, Div, File, FixedLayout, FormLayout, Header, Input, Group, Link, Panel, PopoutWrapper, Select, View, ScreenSpinner } from '@vkontakte/vkui';
import Icon24Upload from '@vkontakte/icons/dist/24/upload';
import Icon24Add from '@vkontakte/icons/dist/24/add';
import Icon24Video from '@vkontakte/icons/dist/24/video';
import { getTime, format } from 'date-fns';
import { MuiPickersUtilsProvider, DateTimePicker } from 'material-ui-pickers';
import DateFnsUtils from "@date-io/date-fns";
import ruLocale from "date-fns/locale/ru";
import { addAlbum, addVideo, editVideo, editVideoApi, deleteVideo, deleteAlbum, editAlbum, getAlbums, getVideos, setPopup, selectAlbum, selectVideo, setVideos2Streams, setActiveTab } from '../../actions';
import User from './../../components/User';
import PageHeader from './../../components/PageHeader';
import VideoItem from './video';
import Album from './album';
import './main.scss';

class Video extends Component {
  constructor() {
    super();
    this.timeNow = new Date();
    this.state = {
      showAlbum: 'all',
      selectedChannels: [],
      selectedStreams: [],
      timeStart: this.timeNow,
      timeEnd: this.timeNow,
      changed: false,
      minutesStep: 15,
    };
  }

  componentDidMount() {
    document.title = "Видео";
    if (!this.props.updated) {
      this.props.getVideos();
      this.props.getAlbums()
        .then(status => {
          if (status && this.props.album_index.length > 0) {
            const albumId = this.props.match.params.id;
            if (albumId && typeof (+albumId) === 'number' && this.props.album[albumId]) {
              this.setState({
                albumId,
                showAlbum: albumId
              });
            }
          }
        });
    }
  }

  popout = () => {
    const popup = this.props.popout;
    switch (popup) {
      case 'hidden':
        return null;
      case 'spinner':
        return <ScreenSpinner />;
      case 'formAddAlbum':
        return this.formAddAlbum;
      case 'formEditAlbum':
        return this.formEditAlbum();
      case 'formAddVideo':
        return this.formAddVideo;
      case 'formEditVideo':
        return this.formEditVideo();
      default:
        return null;
    }
  };

  formAddAlbum = <PopoutWrapper v="center" h="center">
    <FormLayout className="popup">
      <Input
        top="Название"
        alignment="left"
        onChange={e => {
          this.setState({ newAlbum: e.target.value })
        }}
      />
      <Div style={{ display: 'flex' }}>
        <Button
          size="l"
          stretched
          style={{ marginRight: 8 }}
          onClick={() => this.addAlbum()}
        >Сохранить</Button>
        <Button
          size="l"
          stretched
          level="secondary"
          onClick={() => {
            this.setState({ newAlbum: false });
            this.props.setPopup('hidden');
          }}
        >Отмена</Button>
      </Div>
    </FormLayout>
  </PopoutWrapper>;

  formEditAlbum = () => {
    if (this.state.albumId) {
      const id = this.state.albumId;
      const album = this.props.album[id];

      return <PopoutWrapper v="center" h="center">
        <FormLayout className="popup">
          <Input
            top="Название"
            defaultValue={album.name}
            alignment="left"
            onChange={e => {
              const editAlbum = {
                id,
                name: e.target.value
              };
              this.setState({ editAlbum });
            }}
          />
          <Link onClick={() => {
            this.deleteAlbum();
            this.props.setPopup('hidden');
            this.setState({ showAlbum: 'all' });
          }} style={{ marginLeft: 20 }}>Удалить</Link>

          <Div style={{ display: 'flex' }}>
            <Button
              size="l"
              stretched
              style={{ marginRight: 8 }}
              onClick={() => {
                this.editAlbum();
                this.props.setPopup('hidden');
              }}
            >Сохранить</Button>
            <Button
              size="l"
              stretched
              level="secondary"
              onClick={() => {
                this.setState({ editAlbum: false });
                this.props.setPopup('hidden');
              }}>Отмена</Button>
          </Div>
        </FormLayout>
      </PopoutWrapper>
    } else return null;
  };

  formAddVideo = <PopoutWrapper>
    <FormLayout onSubmit={e => this.addVideo(e)} getRef={v => this.newVideoForm = v} className="popup">
      <File name="video" before={<Icon24Video />} size="xl" level="2" />
      <Input top="Название, если оставить пустым, сохранится под именем файла" alignment="left" name="display_name" />
      <Div style={{ display: 'flex' }}>
        <Button size="l" stretched style={{ marginRight: 8 }}>Загрузить</Button>
        <Button size="l" stretched level="secondary" onClick={() => this.props.setPopup('hidden')}>Отмена</Button>
      </Div>
    </FormLayout>
  </PopoutWrapper>;

  formEditVideo = () => {
    const id = this.props.videoId;
    if (id) {
      const { video, album, album_index } = this.props;
      return <PopoutWrapper v="center" h="center">
        <FormLayout className="popup">
          {/* <FormLayout onSubmit={e => this.editVideo(e, id)} getRef={v => this.editVideoForm = v}> */}
          <Input
            top="Название"
            defaultValue={video[id].name}
            alignment="left"
            name="display_name"
            onChange={e => this.setState({ newVideoName: e.target.value })}
          />
          <Select
            top="Альбом"
            placeholder="Выберите альбом"
            defaultValue={video[id].album ? video[id].album : null}
            name="album"
            alignment="left"
            onChange={e => this.setState({ newVideoAlbum: e.target.value })}
          >
            {album_index.map(i => <option key={i} value={i}>{album[i].name}</option>)}
          </Select>
          <Link onClick={() => this.deleteVideo(id)} style={{ marginLeft: 20 }}>Удалить</Link>

          <Div style={{ display: 'flex' }}>
            <Button
              size="l"
              stretched
              style={{ marginRight: 8 }}
              onClick={this.editVideo}
            >Сохранить</Button>
            <Button
              size="l"
              stretched
              level="secondary"
              onClick={() => {
                this.setState({ newVideoAlbum: false, newVideoName: false });
                this.props.editVideo(false);
                this.props.setPopup('hidden');
              }}>Отмена</Button>
          </Div>
        </FormLayout>
      </PopoutWrapper>
    } else return null;
  };

  showAlbum = id => {
    this.setState({
      showAlbum: id,
      albumId: id
    });
    this.props.setActiveTab('video', '/video/album/' + id);
  };

  showAll = () => {
    this.setState({
      showAlbum: 'all',
      albumId: false
    });
    this.props.setActiveTab('video');
  };

  startBroadcast = () => this.setState({ showAlbum: 'broadcast' });

  addAlbum = () => {
    if (this.state.newAlbum) {
      this.props.addAlbum(this.state.newAlbum);
    }
  };

  editAlbum = () => {
    if (this.state.editAlbum) {
      if (this.state.editAlbum.name.trim() !== this.props.album[this.state.editAlbum.id].name) {
        this.props.editAlbum(this.state.editAlbum.id, this.state.editAlbum.name);
      }
    }
  };

  deleteAlbum = () => {
    this.props.deleteAlbum(this.state.showAlbum);
  };

  addVideo = (e) => {
    e.preventDefault();
    if (this.props.token && this.newVideoForm) {
      const formData = new FormData(this.newVideoForm);
      formData.append('token', this.props.token);
      formData.append('action', 'upload');
      this.props.addVideo(this.props.token, formData);
    }
  };

  editVideo = () => {
    const id = this.props.videoId;
    if (!id) this.props.setPopup('hidden');
    const token = this.props.token;
    if (token !== undefined) {
      const display_name = this.state.newVideoName ? this.state.newVideoName : this.props.video[id].name;
      let album = 0;
      if (this.state.newVideoAlbum === undefined) {
        if (this.props.video[id].album) album = this.props.video[id].album;
      } else if (this.state.newVideoAlbum !== '') album = this.state.newVideoAlbum;

      const formData = {
        id,
        display_name,
        album,
        action: 'update'
      };
      this.props.editVideoApi(formData)
        .then(this.props.getAlbums);
    }
  };

  deleteVideo = id => {
    this.props.deleteVideo(id)
      .then(this.props.getAlbums);
  };

  selectChannel = id => {
    const ind = this.state.selectedChannels.indexOf(id);
    if (ind === -1) this.setState({
      selectedChannels: [
        ...this.state.selectedChannels,
        id
      ]
    });
    else this.setState({
      selectedChannels: [
        ...this.state.selectedChannels.slice(0, ind),
        ...this.state.selectedChannels.slice(ind + 1)
      ]
    });
  };

  selectStream = id => {
    const ind = this.state.selectedStreams.indexOf(id);
    if (ind === -1) this.setState({
      selectedStreams: [
        ...this.state.selectedStreams,
        id
      ]
    });
    else this.setState({
      selectedStreams: [
        ...this.state.selectedStreams.slice(0, ind),
        ...this.state.selectedStreams.slice(ind + 1)
      ]
    });
  };

  setVideos2Streams = () => {
    if (this.props.token && this.props.selectedVideos && this.state.selectedStreams && this.props.selectedVideos.length > 0 && this.state.selectedStreams.length > 0) {
      const token = this.props.token;
      const formData = {
        action: 'video2stream',
        token,
        videos: this.props.selectedVideos.join(','),
        channels: this.state.selectedChannels.join(','),
        streams: this.state.selectedStreams.join(',')
      };
      this.props.setVideos2Streams(token, formData);
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

  render() {
    const { video, video_index, album, album_index } = this.props;

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
          {this.props.user ? <User /> : null}
          {this.state.showAlbum !== 'all' ?
            <Div>
              <Link onClick={this.showAll}>К списку альбомов</Link>
            </Div>
            : null}
          {this.state.showAlbum !== 'broadcast' ?
            <Div>
              <Button
                before={<Icon24Upload />}
                size="l"
                onClick={() => this.props.setPopup('formAddVideo')}
                style={{ marginRight: 5 }}
              >Загрузить видео</Button>
              {this.state.showAlbum === 'all' ?
                <Button
                  before={<Icon24Add />}
                  size="l"
                  onClick={() => this.props.setPopup('formAddAlbum')}
                >Добавить альбом</Button> : null}
            </Div>
            : null
          }
          {this.state.showAlbum === 'broadcast' ?
            <Div>
              <FormLayout>
                <Header>Транслировать видео</Header>
                {this.props.owner_index && this.props.owner_index.length > 0 ?
                  <Fragment>
                    <Header level="2">Мои каналы</Header>
                    {this.props.owner_index.map(id => {
                      return (<Cell
                        key={id}
                        before={<Avatar type="image" src={this.props.owner[id].photo} />}
                        asideContent={<Checkbox onClick={() => this.selectChannel(id)} disabled />}
                        size='l'
                        multiline
                        description={this.props.owner[id].time ? 'Проданное время' : null}
                        bottomContent={this.props.owner[id].time && this.props.owner[id].time.length > 0 ?
                          this.props.owner[id].time.map((time, i) => {
                            return <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                              {format(time.start * 1000, 'dd.MM.yy HH:mm')}
                              &nbsp;&nbsp;-&nbsp;&nbsp;
                              {format(time.end * 1000, 'dd.MM.yy HH:mm')}
                              <Checkbox onClick={() => this.selectStream(time.id)} />
                            </div>
                          }) : null}
                      >
                        {this.props.owner[id].name}
                      </Cell>);
                    })}
                  </Fragment>
                  : null}
                {this.props.purchased_index && this.props.purchased_index.length > 0 ?
                  <Fragment>
                    <Header level="2">Купленные каналы</Header>
                    {this.props.purchased_index.map(id => {
                      return (<Cell
                        key={id}
                        before={<Avatar type="image" src={this.props.purchased[id].photo} />}
                        asideContent={<Checkbox disabled onClick={() => this.selectChannel(id)} />}
                        size='l'
                        multiline
                        description={this.props.purchased[id].time ? 'Купленное время' : null}
                        bottomContent={this.props.purchased[id].time && this.props.purchased[id].time.length > 0 ?
                          this.props.purchased[id].time.map((time, i) => {
                            return <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                              {format(time.start * 1000, 'dd.MM.yy HH:mm')}
                              &nbsp;&nbsp;-&nbsp;&nbsp;
                              {format(time.end * 1000, 'dd.MM.yy HH:mm')}
                              <Checkbox onClick={() => this.selectStream(time.id)} />
                            </div>
                          }) : null}
                      >
                        {this.props.purchased[id].name}
                      </Cell>);
                    })}
                  </Fragment>
                  : null}
                <Checkbox onClick={() => this.setState({ toLoop: !this.state.toLoop })} defaultChecked={!!this.state.toLoop}>Зациклить</Checkbox>
                <Checkbox onClick={() => this.setState({ setTime: !this.state.setTime })} defaultChecked={!!this.state.setTime}>Указать время</Checkbox>
                {this.state.setTime ?
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
                  : null}
                <Checkbox onClick={() => this.setState({ block: !this.state.block })} defaultChecked={!!this.state.block}>Заблокировать для других трансляций</Checkbox>
                {this.props.process}
                <Div style={{ display: 'flex' }}>
                  <Button size="l" stretched style={{ marginRight: 8 }} onClick={this.setVideos2Streams}>Применить</Button>
                  <Button size="l" stretched level="secondary" onClick={this.showAll}>Закрыть</Button>
                </Div>
              </FormLayout>
            </Div>
            : this.state.showAlbum === 'all' ?
              <div>
                <Group title="Альбомы">
                  <Div>
                    {album_index.map(id => {
                      return (
                        <Album
                          key={id}
                          data={album[id]}
                          showAlbum={this.showAlbum}
                          selectAlbum={this.props.selectAlbum}
                        />
                      );
                    })}
                  </Div>
                </Group>
                <Group title="Видео">
                  <Div>
                    {video_index.map(id => <VideoItem
                      key={id}
                      id={id}
                    />)}
                  </Div>
                </Group>
              </div>
              :
              <Group>
                <Cell asideContent={<Button size="l" onClick={() => this.props.setPopup('formEditAlbum')}>Редактировать</Button>}>
                  <h2>{album[this.state.showAlbum].name}</h2>
                </Cell>
                <Div>
                  {video_index.filter(id => video[id].album && +video[id].album === +this.state.showAlbum).map(id => <VideoItem
                    key={id}
                    id={id}
                  />)}
                </Div>
              </Group>
          }
          {this.state.showAlbum !== 'broadcast' ?
            <FixedLayout className="fixedfooter" vertical="bottom">
              <Cell className="container" asideContent={`Выбрано: ${this.props.selectedVideos.length}`}>
                <Button
                  onClick={this.startBroadcast}
                  size="l"
                >Транслировать</Button>
              </Cell>
            </FixedLayout>
            : null
          }
        </Group>
      </Panel>
    </View>
  }
}

const mapStateToProps = state => {
  return {
    token: state.app.token,
    user: state.app.user,
    process: state.app.process,
    activeTab: state.app.activeTab,
    popout: state.app.popout,
    videoId: state.videos.videoId,
    video: state.videos.video,
    video_index: state.videos.video_index,
    selectedVideos: state.videos.selectedVideos,
    updated: state.videos.updated,
    album: state.albums.albums,
    album_index: state.albums.albums_index,
    owner: state.channels.owner,
    owner_index: state.channels.owner_index,
    purchased: state.channels.purchased,
    purchased_index: state.channels.purchased_index,
  }
};

const mapDispatchToProps = {
  addAlbum,
  addVideo,
  editVideo,
  editVideoApi,
  deleteVideo,
  deleteAlbum,
  editAlbum,
  getAlbums,
  getVideos,
  setPopup,
  selectAlbum,
  selectVideo,
  setVideos2Streams,
  setActiveTab
};

export default connect(mapStateToProps, mapDispatchToProps)(Video);
