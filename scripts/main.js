const View = require('./view');
import App from './components/app';
import CreateGame from './components/create_game';
import Game from './components/ongoing_game';
const ReactDOM = require('react-dom');
const React = require('react');
import { Router, Route, IndexRoute, browserHistory} from 'react-router';
// import {browserHistory} from 'react-router';

// browserHistory.push(`/profile/${username}`)

const URLMatcher = (
      <Router history={browserHistory}>
        <Route path="/" component={App}>
          <IndexRoute component={CreateGame} />
          <Route path="game/:gameID" component={Game}/>
        </Route>
      </Router>
);

document.addEventListener('DOMContentLoaded', function(){
	//if there is an id, send ajax

  let wrapper = document.getElementById('wrapper');
  ReactDOM.render(URLMatcher, wrapper);
});
