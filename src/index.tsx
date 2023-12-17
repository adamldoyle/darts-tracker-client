import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import { CssBaseline, Container } from '@material-ui/core';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContextProvider } from '@adamldoyle/react-aws-auth-context-mui-formik';
import { reportWebVitals } from './reportWebVitals';
import { error, aws } from 'shared/utils';
import { store } from './store/configureStore';
import { App } from 'layout/components';
import { AuthInjector } from './store/auth/slice';

error.initSentry();
aws.configure();

const persistor = persistStore(store);

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Container component="main" maxWidth={false}>
        <CssBaseline />
        <ToastContainer position="top-center" autoClose={5000} draggable={false} />
        <AuthContextProvider sessionPingDelay={45}>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <AuthInjector>
                <App />
              </AuthInjector>
            </PersistGate>
          </Provider>
        </AuthContextProvider>
      </Container>
    </Router>
  </React.StrictMode>,
  document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
