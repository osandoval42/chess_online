const React = require('react');
const View = require('../view');

const OngoingGame = React.createClass({
  componentDidMount(){
    var socket = io();
    // var socket = io('http://localhost');
    //how to confirm game is real and get its state
      let mainEl = document.getElementById('root');
      new View(mainEl);
  },
  render(){
      return (
        <div  className="hidden">
        </div>
      )
  }
})

module.exports = OngoingGame;