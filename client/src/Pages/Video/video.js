import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Cell, Checkbox } from '@vkontakte/vkui';
import Icon24Write from '@vkontakte/icons/dist/24/write';
import './main.scss';
import { editVideo, selectVideo } from '../../actions';


class VideoItem extends Component {

  render() {

    const id = +this.props.id;
    const { preview, name, checked } = this.props.video;

    return <div className="video-item">
      <div
        className="preview"
        onClick={() => this.props.selectVideo(id)}
      >
        <Checkbox
          checked={!!checked}
          onChange={() => this.props.selectVideo(id)}
        />
        <img src={'/upload/thumbnails/' + preview} alt="" />
      </div>
      <Cell asideContent={<div onClick={() => this.props.editVideo(id)}><Icon24Write /></div>}>{name}</Cell>
    </div >
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    video: state.videos.video[ownProps.id]
  }
};

const mapDispatchToProps = {
  editVideo,
  selectVideo
};

export default connect(mapStateToProps, mapDispatchToProps)(VideoItem);

