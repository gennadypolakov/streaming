import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import albums from './albums';
import app from './app';
import balance from './balance';
import channels from './channels';
import schedule from './schedule';
import tariffs from './tariffs';
import videos from './videos';

export default history => combineReducers({
    router: connectRouter(history),
    albums,
    app,
    balance,
    channels,
    schedule,
    tariffs,
    videos
});