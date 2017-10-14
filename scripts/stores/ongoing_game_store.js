const AppDispatcher = require('../dispatcher/dispatcher.js');
const Store = require('flux/utils').Store;
// const PostConstants = require('../constants/post_constants');
const OngoingGameStore = new Store(AppDispatcher);
console.log(`OngoingGameStore is ${OngoingGameStore}`)

let _onGoingGameData = {};

OngoingGameStore.gameData = function(){
	return _onGoingGameData;
}

//{gameHasStarted: false, playerColor: "black", gameId: "59db90abfa87c508add7f9c0"}
OngoingGameStore.createGame = function(payload){
	_onGoingGameData = payload.gameData
	OngoingGameStore.__emitChange();
}

OngoingGameStore.addBoard = function(boardJSON){
	_onGoingGameData.boardJSON = boardJSON;
}

OngoingGameStore.reflectChangedBoard = function(payload){
	//how to reflect move confirmation data
	_onGoingGameData = payload.gameData
	OngoingGameStore.__emitChange();
}


OngoingGameStore.__onDispatch = function(payload){
  switch(payload.actionType){
    case "createGame":
      OngoingGameStore.createGame(payload);
      break;
    case "moveRecieved":
    	OngoingGameStore.reflectChangedBoard(payload);
    	breakl
  }
}

module.exports = OngoingGameStore;