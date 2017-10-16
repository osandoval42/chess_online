const Colors = require('./constants/colors');
const Board = require('./board');
const MoveResults = require('./constants/move_results');
const Unicode = require('./constants/pieces_unicode');
const Clock = require('./clock');

const api = require("./api_calls/api");

const ongoingGameStore = require('./stores/ongoing_game_store');


import {browserHistory} from 'react-router';



const View = function(mainEl, firstTime, firstPersonClockDisplay, opponentClockDisplay){
  this.mainEl = mainEl;
  this.createWinMessage()
  this.createPawnConversionTab()
  this.chessBoardDisplay = mainEl.querySelector('.chess-board');
  this.playerColor = ongoingGameStore.gameData().playerColor;
  console.log(`player color on client is ${this.playerColor}`);

  if (firstTime === true){
    console.log("ran first time")
    this.createClockDisplays();
  } else {
    console.log("ran not first time")
    this.firstPersonClockDisplay = firstPersonClockDisplay;
    this.opponentClockDisplay = opponentClockDisplay;
  }

  this.syncBoardToGameState();
  this.setUp()
};

View.prototype.syncBoardToGameState = function(){
  let gameData = ongoingGameStore.gameData()
  this.board = Board.initializeBoard();
  this.toMove = gameData.toMove;
  this.startPos = null;
  this.squareClickDisabled = (gameData.gameHasStarted === true) ? false : true;
  this.setUpClock();
}

//LEFT off need to create clock displays
 View.prototype.createClockDisplays = function(){
  this.opponentClockDisplay = document.createElement('div');
  this.opponentClockDisplay.className = 'opponent-clock clock-display'

  this.firstPersonClockDisplay = document.createElement('div');
  this.firstPersonClockDisplay.className = 'first-person-clock clock-display'

  this.mainEl.appendChild(this.firstPersonClockDisplay);
  this.mainEl.appendChild(this.opponentClockDisplay);
}

View.prototype.setUpClock = function(){
  // this.squareClickDisabled = false;
  //vuelva
  // this.timeQuestionTab.style.display = 'none';
  let gameData = ongoingGameStore.gameData()
  let firstPersonMilliSecondsLeft;
  let opponentMilliSecondsLeft;
  if (gameData.toMove === gameData.playerColor){
    firstPersonMilliSecondsLeft = gameData.playerToMoveMilliSecondsLeft
    opponentMilliSecondsLeft = gameData.playerNotToMoveMilliSecondsLeft
  } else {
    firstPersonMilliSecondsLeft = gameData.playerNotToMoveMilliSecondsLeft;
    opponentMilliSecondsLeft = gameData.playerToMoveMilliSecondsLeft;
  }
  if (this.firstPersonClock !== undefined){
    this.firstPersonClock.stop();
    this.opponentClock.stop();
  }
  let opponentColor = gameData.playerColor === "white" ? "black" : "white"
  this.firstPersonClock = new Clock(firstPersonMilliSecondsLeft, this.showWinMessage.bind(this, opponentColor), this.firstPersonClockDisplay);
  this.opponentClock = new Clock(opponentMilliSecondsLeft, this.showWinMessage.bind(this, gameData.playerColor), this.opponentClockDisplay);

  this.startClock(gameData);
}

View.prototype.startClock = function(gameData){
  if (gameData.gameHasStarted){
    console.log("start clock hit")
    console.log(JSON.stringify(gameData));
    let clockMoving = (gameData.toMove === gameData.playerColor) ? this.firstPersonClock : this.opponentClock;
    clockMoving.start();
  }
}

 View.prototype.createPawnConversionTab = function(){
  this.pawnConversionTab = document.createElement('div');
  this.pawnConversionTab.className = 'pawn-conversion-tab';
  this.mainEl.appendChild(this.pawnConversionTab);

  this.pawnConversionTab.innerHTML = `<span class="pawn-conversion-piece">${Unicode.BLACK_ROOK}</span><span class="pawn-conversion-piece">${Unicode.BLACK_KNIGHT}</span><span class="pawn-conversion-piece">${Unicode.BLACK_BISHOP}</span><span class="pawn-conversion-piece">${Unicode.BLACK_QUEEN}</span>`
}

 View.prototype.createWinMessage = function(){
  this.winMessage = document.createElement('div');
  this.winMessage.className = 'win-message';

  let winMessageContainer = document.createElement('div');
  winMessageContainer.className = 'win-message-container';
  this.winMessage.appendChild(winMessageContainer);

  winMessageContainer.innerHTML = "<span class='close-message-button'>x</span><span class='message-content'></span>";
  let closeButton = winMessageContainer.firstChild
  this.winMessageContent = winMessageContainer.lastChild
  closeButton.addEventListener('click', () => {
    this.winMessage.style.display = 'none';
  })

  this.mainEl.appendChild(this.winMessage);
}

 View.prototype.setUp = function(){
  this.setUpBoard(this);
}





//  View.prototype.createTimeQuestion = function(){

// }

View.prototype.switchClockRunning = function(){
  this.firstPersonClock.toggleRunning();
  this.opponentClock.toggleRunning();
}

 View.prototype.setUpBoard = function(){
  let html = '';
  for (var i = 0; i < 8; i++){
    for (var j = 0; j < 8; j++){
      let square = document.createElement('li');
      square.addEventListener('click', this.squareClick.bind(this, {row: i, col: j}));

      if((i + j) % 2 === 0){
        square.className = 'white';
      }
      else{
        square.className ='black';
      }

      square.innerHTML = '<span></span>'
      this.chessBoardDisplay.appendChild(square);
    }
  }
  this.chessBoardDisplay.className = ongoingGameStore.gameData().playerColor === "black" ?
  "chess-board black-to-move" : "chess-board"
  this.render();
};

View.prototype.render = function(){
  this.board.renderPieces(this.chessBoardDisplay.querySelectorAll('span'));
};

View.prototype.squareClick = function(pos){
  if (this.squareClickDisabled === true){
    console.log("square clicked cant because is disabled")
    return;
  }

  if (this.startPos === null){    
    return this.selectPiece(pos);
  }
  else{
    if (pos === this.startPos){
      this.unselectPiece();
      this.render();
    }
    else{
      let moveResult = this.move(pos);
      if(moveResult !== MoveResults.FAILURE && moveResult !== MoveResults.CHECKMATE
      && moveResult !== MoveResults.SUCCESS){ //pawn promotions position was returned
        this.render()
        return this.demandPawnPromotion(moveResult);
      }
      if (moveResult === MoveResults.SUCCESS){
        this.postMoveToBackend(pos);
        this.renderMoveResult();
      }
      if (moveResult === MoveResults.CHECKMATE){
        this.postMoveToBackend(pos);
        this.renderMoveResult()
        this.renderWonFromFrontEndMove();
      }
      return moveResult;
    }
  }
};
//how to let user know they are disconnectec

//how to have backend clock determine winner, never front end clock

View.prototype.renderMoveResult = function(){
  this.switchClockRunning();
  this.unselectPiece();
  this.render();
  this.changeToMove();
  // this.flipBoard()
  // this.flipClocks()
}

View.prototype.demandPawnPromotion = function(pos){
  this.squareClickDisabled = true;
  let pieces = this.pawnConversionTab.children;
  pieces[0].onclick = this.makePromotion.bind(this, pos, 'Rook');
  pieces[1].onclick = this.makePromotion.bind(this, pos, 'Knight');
  pieces[2].onclick = this.makePromotion.bind(this, pos, 'Bishop');
  pieces[3].onclick = this.makePromotion.bind(this, pos, 'Queen');

  this.pawnConversionTab.style.display = 'flex';
}

View.prototype.postMoveToBackend = function(endPos, promotionPiece){
  api.makeMove({
    startPos: this.startPos,
    endPos: endPos,
    gameId: ongoingGameStore.gameData().gameId,
    promotionPiece
  });
}

View.prototype.makePromotion = function(pos, chosenPiece){
  const moveResult = this.board.makePromotion(pos, chosenPiece);
  this.postMoveToBackend(pos, chosenPiece);

  this.pawnConversionTab.style.display = 'none';
  this.renderMoveResult();
  if (moveResult === MoveResults.CHECKMATE){
    return this.renderWonFromFrontEndMove();
  }

  this.squareClickDisabled = false;
}

View.prototype.selectPiece = function(pos){
  let piece = this.board.getPiece(pos)
  if (piece.color !== this.toMove || piece.color !== this.playerColor){
    console.log(`invalid select with piece.color:${piece.color} and toMove:${this.toMove} and playerColor: ${this.playerColor}`);
    return 'invalid selection'
  }
  else{
    this.startPos = pos;
    this.addSelectedClass(pos);
    this.render()
  }
}

View.prototype.unselectPiece = function(){
  this.removeSelectedClass()
  this.startPos = null;
}

View.prototype.addSelectedClass = function(pos){
  const squareIdx = (pos.row * 8) + pos.col;
  const square = this.chessBoardDisplay.children[squareIdx]

  square.className += ' selected'
}

View.prototype.removeSelectedClass = function(){
  const squareIdx = (this.startPos.row * 8) + this.startPos.col;
  const square = this.chessBoardDisplay.children[squareIdx]

  const selectedMatch = new RegExp('(^|\\s)' + 'selected' + '(\\s|$)');
  square.className = square.className.replace(selectedMatch, ' ');
}

View.prototype.move = function(endPos){ //return successful move
  const move_results = this.board.move(this.startPos, endPos);

  return move_results;
}

View.prototype.changeToMove = function(){
  this.toMove = this.toMove === Colors.WHITE ? Colors.BLACK : Colors.WHITE;
}

// View.prototype.flipBoard = function(){
//   this.chessBoardDisplay.className = this.chessBoardDisplay.className === "chess-board" ?
//     "chess-board black-to-move" : "chess-board"
// }

// View.prototype.flipClocks = function(){
//   this.firstPersonClockDisplay.className = this.firstPersonClockDisplay.className === "to-move-clock clock-display" ?
//     "just-moved-clock clock-display"  : "to-move-clock clock-display"
//   this.opponentClockDisplay.className = this.opponentClockDisplay.className === "to-move-clock clock-display" ?
//     "just-moved-clock clock-display"  : "to-move-clock clock-display"
// }

View.prototype.renderWonFromFrontEndMove = function(){
  this.changeToMove();
  let winner = this.toMove;
  this.showWinMessage(winner);
}

View.prototype.showWinMessage = function(winner){
    this.firstPersonClock.stop()
    this.opponentClock.stop()
    let message = `${winner.toUpperCase()} WINS!`
    this.winMessageContent.innerHTML = message;
    this.winMessage.style.display = 'block';
    this.squareClickDisabled = true;
}



module.exports = View;
