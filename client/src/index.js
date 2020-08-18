import 'core-js/es6/map';
import 'core-js/es6/set';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { configureStore, history } from './configureStore';
import connectVk from '@vkontakte/vkui-connect';
import App from './App';

const store = configureStore();

// Init VK App
connectVk.send('VKWebAppInit', {});

ReactDOM.render(
  <div className="container" style={{height: '100%'}}>
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <App />
      </ConnectedRouter>
    </Provider>
  </div>,
  document.getElementById('root')
);
