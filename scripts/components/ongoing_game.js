const React = require('react');
const View = require('../view');
const Store = require('../stores/ongoing_game_store');
const AppDispatcher = require('../dispatcher/dispatcher.js');
const gameApi = require("../api_calls/api");

const OngoingGame = React.createClass({
  componentDidMount(){
    this.listenerId = Store.addListener(this.renderGame);
    //how to make it so sockets always are returning game state to store, not response

    // var socket = io('http://localhost');
    //how to confirm game is real and get its state
    let gameData = Store.gameData()

    if (gameData.gameHasStarted === undefined){ 
        this.displayLoadingMsg();
        this.joinGame();
    } else { //how to prevent this from being called if we are in one game then type another url
      //(how to to prevent this entering unless we just hit create game)
      this.setupSocket(gameData);
      this.startGameRender();
    }    
  },
  joinGame(){
    gameApi.joinGame(this.props.params.gameId, this.receiveGame.bind(this), this.receiveErrGameJoin.bind(this));
  },
  receiveGame(json){
    this.startGameRender();
    let payload = {actionType: "gameJoined", gameData: json}
    AppDispatcher.dispatch(payload)
    this.stopDisplayLoadingMsg();
    this.setupSocket(json);
    //fetch game data, if checks out, merge with store, stoploading, setup socket
  },
  receiveErrGameJoin(err){
    console.error(`receive game join err: ${err}`)
  },
  setupSocket(gameData){
      var socket = io(`http://localhost:3000/game-${gameData.gameId}`);
      console.log(`client group /http://localhost:3000/game-${gameData.gameId}`)
      socket.on('new game state received', function(data){
        console.log(`${gameData.playerColor} received socket data from server ${data}`);
        let payload = {actionType: "moveReceived", gameData: data}
        AppDispatcher.dispatch(payload)
      })
  },
  startGameRender(){
        let mainEl = document.getElementById('root');
        this.view = new View(mainEl);
  },
  renderGame(){
      //how to have view setup properly
      console.log("game render from ongoing game made");
      this.view.syncBoardToGameState();
      this.view.render();
  },
  displayLoadingMsg(){

  },
  stopDisplayLoadingMsg(){

  },
  componentWillUnmount(){
    Store.destroyGameState()
    Store.removeListener(this.listenerId);
  },
  render(){
      return (
        <div  className="hidden">
        </div>
      )
  }
})

module.exports = OngoingGame;