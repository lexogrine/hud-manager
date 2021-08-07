
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
import WindowBar from './WindowBar';

const url = new URL(window.location.href);
const isHLAEGUI = url.searchParams.get('hlaegui');
if (isHLAEGUI === null) {
	ReactDOM.render(<WindowBar />, document.getElementById('window-bar-area'));
}

ReactDOM.render(<App />, document.getElementById('root'));
