import { createBrowserHistory } from 'history';
import { applyMiddleware, createStore, compose } from 'redux';
import { routerMiddleware } from 'connected-react-router';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

import createRootReducer from './reducers';

export const history = createBrowserHistory();

export const configureStore = preloadedState => {
    return createStore(
        createRootReducer(history),
        preloadedState,
        // compose(
        composeWithDevTools(
            applyMiddleware(
                routerMiddleware(history),
                thunk
            )
        )
    );
};
