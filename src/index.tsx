import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
import WindowBar from './WindowBar';

ReactDOM.render(<WindowBar />, document.getElementById('window-bar-area'));

ReactDOM.render(<App />, document.getElementById('root'));
