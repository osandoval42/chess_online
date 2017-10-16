const React = require('react');
const gameApi = require("../api_calls/api");
const AppDispatcher = require('../dispatcher/dispatcher.js');
import {browserHistory} from 'react-router';


const CreateGame = React.createClass({
  componentDidMount(){
    if (this.hasMounted !== true){
       this.hasMounted = true
       this.createTimeQuestion()
    }
  },
  createTimeQuestion(){
      this.mainEl = document.getElementById('root')

      this.timeQuestionTab = document.createElement('div');
      this.timeQuestionTab.className = 'time-question-tab'
      this.timeQuestionTab.innerHTML = '<div class="time-question-container"><span class="time-choices"></span></div>'
      let timeChoiceBox = this.timeQuestionTab.firstChild.firstChild
      const MINUTES = [5, 10, 15, 30]
      timeChoiceBox.innerHTML = `<button class="time-choice">${MINUTES[0]} minutes</button><button class="time-choice">${MINUTES[1]} minutes</button><button class="time-choice">${MINUTES[2]} minutes</button><button class="time-choice">${MINUTES[3]} minutes</button>`
      let timeChoices = timeChoiceBox.children
      timeChoices[0].onclick = this.startGame.bind(this, MINUTES[0])
      timeChoices[1].onclick = this.startGame.bind(this, MINUTES[1])
      timeChoices[2].onclick = this.startGame.bind(this, MINUTES[2])
      timeChoices[3].onclick = this.startGame.bind(this, MINUTES[3])

      let direction = document.createElement('span');
      direction.innerHTML = 'Choose A Play Clock!';
      direction.className = 'time-direction';

      timeChoiceBox.appendChild(direction);


      this.mainEl.appendChild(this.timeQuestionTab);
  },
  receiveGameStart(json){
    console.log("received game start");
    console.log(json);
    //{gameHasStarted: false, playerColor: "black", gameId: "59db90abfa87c508add7f9c0"}
    let payload = {actionType: "createGame", gameData: json}

    //how to pass color and whether game hasStarted to board
    AppDispatcher.dispatch(payload)

    browserHistory.push(`/game/${json.gameId}`)
  },
  receiveErrGameStart(){
    console.log("err game start")
  },
  startGame(minutes){
    this.timeQuestionTab.style.display = 'none';
    gameApi.startGame({minutes}, this.receiveGameStart.bind(this), this.receiveErrGameStart.bind(this))
  },
  render(){
      return (
        <div  className="start-game-modal">          
        </div>
      )
  }
})
//<a onClick={this.startGame}>Start Game</a>
//add spin wheel for game start

module.exports = CreateGame;
//allow choosing of time.  server 50/50 white black.  
//server sends back playerString, gameHasStarted, color, gameId

//left off.  THIS GAME IS NOT IN REACT, consider this fact

//add in join game, in which server sends back secondsLeft