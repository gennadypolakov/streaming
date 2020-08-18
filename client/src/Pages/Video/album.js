import React from 'react';
import { Checkbox } from '@vkontakte/vkui';
import './main.scss';

class Album extends React.Component {
    // constructor(props) {
    //     super(props);
    // }

    render() {
        const { showAlbum, selectAlbum } = this.props;
        const { id, name, preview, countVideo, checked, } = this.props.data;
        return (
            <div className="album">
                <div className="preview">
                    <Checkbox onClick={() => selectAlbum(+id)} defaultChecked={!!checked} />
                    <div className="quantity">{countVideo}</div>
                    <img src={'/upload/thumbnails/' + preview} onClick={() => showAlbum(+id)} alt="" />
                </div>
                <div className="album_name" onClick={() => showAlbum(+id)}>{name}</div>
            </div>
        );
    }
}
export default Album;