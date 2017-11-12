const React = require('react');
const View = require('../view');
const Store = require('../stores/ongoing_game_store');
const AppDispatcher = require('../dispatcher/dispatcher.js');
const gameApi = require("../api_calls/api");

const OngoingGame = React.createClass({
  componentDidMount(){
    if (this.hasMounted !== true){
       this.hasMounted = true
      let gameData = Store.gameData()

      if (gameData.gameHasStarted === undefined){ 
          this.displayLoadingMsg();
          this.joinGame();
      } else { //how to prevent this from being called if we are in one game then type another url
        //(how to to prevent this entering unless we just hit create game)
        this.setupSocket(gameData);
        this.startGameRender();
        this.listenerId = Store.addListener(this.renderGame);        
      }    
    }

  },
  joinGame(){
    gameApi.joinGame(this.props.params.gameId, this.receiveGame.bind(this), this.receiveErrGameJoin.bind(this));
  },
  receiveGame(json){
    console.log(`game received ${JSON.stringify(json)}`)
    let payload = {actionType: "gameJoined", gameData: json}
    AppDispatcher.dispatch(payload)
    this.stopDisplayLoadingMsg();
    this.startGameRender();
    this.listenerId = Store.addListener(this.renderGame);
    this.setupSocket(json);
    //fetch game data, if checks out, merge with store, stoploading, setup socket
  },
  receiveErrGameJoin(err){
    console.error(`receive game join err: ${err}`)
  },
  setupSocket(gameData){
      var socket = io(`http://localhost:3000/game-${gameData.gameId}`);
      // console.log(`client group /http://localhost:3000/game-${gameData.gameId}`)
      socket.on('new game state received', function(data){
        console.log(`${gameData.playerColor} received socket data from server ${data}`);
        let payload = {actionType: "moveReceived", gameData: data}
        AppDispatcher.dispatch(payload)
      })
  },
  startGameRender(){
        let mainEl = document.getElementById('root');
        if (this.view !== undefined){    
          this.view = new View(mainEl, false, this.view.firstPersonClockDisplay, this.view.opponentClockDisplay);  
        } else {
          this.view = new View(mainEl, true);
        }         
  },
  renderGame(){
      //how to have view setup properly
      console.log("game render from ongoing game made");
      let won = Store.gameData().won
      this.view.syncBoardToGameState();
      this.view.render();
      if (won !== undefined){        
        this.view.showWinMessage(won);
      }      
  },
  displayLoadingMsg(){

  },
  stopDisplayLoadingMsg(){

  },
  componentWillUnmount(){
    Store.destroyGameState()
    this.listenerId.remove();
  },
  render(){
      return (
        <div  className="hidden">
        </div>
      )
  }
})

module.exports = OngoingGame;