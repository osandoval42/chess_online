const React = require('react');
const gameApi = require("../api_calls/api");
const AppDispatcher = require('../dispatcher/dispatcher.js');
import {browserHistory} from 'react-router';


const CreateGame = React.createClass({
  receiveGameStart(json){
    //{gameHasStarted: false, playerColor: "black", gameId: "59db90abfa87c508add7f9c0"}
    let payload = {actionType: "createGame", gameData: json}

    //how to pass color and whether game hasStarted to board
    AppDispatcher.dispatch(payload)

    browserHistory.push(`/game/${json.gameId}`)
  },
  receiveErrGameStart(){
    console.log("err game start")
  },
  startGame(){
    gameApi.startGame(this.receiveGameStart.bind(this), this.receiveErrGameStart.bind(this))
  },
  render(){
      return (
        <div  className="start-game-modal">
          <a onClick={this.startGame}>Start Game</a>
        </div>
      )
  }
})
//add spin wheel for game start

module.exports = CreateGame;
//allow choosing of time.  server 50/50 white black.  
//server sends back playerString, gameHasStarted, color, gameId

//left off.  THIS GAME IS NOT IN REACT, consider this fact

//add in join game, in which server sends back secondsLeft