const Colors = require('./constants/colors');
const Board = require('./board');
const MoveResults = require('./constants/move_results');
const Unicode = require('./constants/pieces_unicode');
const Clock = require('./clock');

const View = function(mainEl){
  this.mainEl = mainEl;
  this.createWinMessage()
  this.createPawnConversionTab()

  this.createTimeQuestion()
  this.createClockDisplays()
  this.chessBoardDisplay = mainEl.querySelector('.chess-board');
  this.board = Board.initializeBoard();
  this.setUp()
  this.toMove = Colors.WHITE;
  this.startPos = null;
  this.squareClickDisabled = true;

};


 View.prototype.createClockDisplays = function(){
  this.blackClockDisplay = document.createElement('div');
  this.blackClockDisplay.className = 'just-moved-clock clock-display'

  this.whiteClockDisplay = document.createElement('div');
  this.whiteClockDisplay.className = 'to-move-clock clock-display'

  this.mainEl.appendChild(this.whiteClockDisplay);
  this.mainEl.appendChild(this.blackClockDisplay);
}

 View.prototype.createTimeQuestion = function(){
  this.timeQuestionTab = document.createElement('div');
  this.timeQuestionTab.className = 'time-question-tab'
  this.timeQuestionTab.innerHTML = '<div class="time-question-container"><span class="time-choices"></span></div>'
  let timeChoiceBox = this.timeQuestionTab.firstChild.firstChild
  const MINUTES = [5, 10, 15, 30]
  timeChoiceBox.innerHTML = `<button class="time-choice">${MINUTES[0]} minutes</button><button class="time-choice">${MINUTES[1]} minutes</button><button class="time-choice">${MINUTES[2]} minutes</button><button class="time-choice">${MINUTES[3]} minutes</button>`
  let timeChoices = timeChoiceBox.children
  timeChoices[0].onclick = this.setUpClock.bind(this, MINUTES[0])
  timeChoices[1].onclick = this.setUpClock.bind(this, MINUTES[1])
  timeChoices[2].onclick = this.setUpClock.bind(this, MINUTES[2])
  timeChoices[3].onclick = this.setUpClock.bind(this, MINUTES[3])

  let direction = document.createElement('span');
  direction.innerHTML = 'Choose A Play Clock!';
  direction.className = 'time-direction';

  timeChoiceBox.appendChild(direction);


  this.mainEl.appendChild(this.timeQuestionTab);
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

View.prototype.setUpClock = function(minutes){
  this.squareClickDisabled = false;
  this.timeQuestionTab.style.display = 'none';
  this.whiteClock = new Clock(minutes, this.renderWon.bind(this), this.whiteClockDisplay);
  this.blackClock = new Clock(minutes, this.renderWon.bind(this), this.blackClockDisplay);

  this.whiteClock.start();
}

View.prototype.switchClockRunning = function(){
  this.whiteClock.toggleRunning();
  this.blackClock.toggleRunning();
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

  this.render();
};

View.prototype.render = function(){
  this.board.renderPieces(this.chessBoardDisplay.querySelectorAll('span'));
};

View.prototype.squareClick = function(pos){
  if (this.squareClickDisabled === true){
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
        this.renderMoveResult();
      }
      if (moveResult === MoveResults.CHECKMATE){
        this.renderMoveResult()
        this.renderWon();
      }
      return moveResult;
    }
  }
};

View.prototype.renderMoveResult = function(){
  this.switchClockRunning();
  this.unselectPiece();
  this.render();
  this.changeToMove();
  this.flipBoard()
  this.flipClocks()
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

View.prototype.makePromotion = function(pos, chosenPiece){
  const moveResult = this.board.makePromotion(pos, chosenPiece);
  this.pawnConversionTab.style.display = 'none';
  this.renderMoveResult();
  if (moveResult === MoveResults.CHECKMATE){
    return this.renderWon();
  }

  this.squareClickDisabled = false;
}

View.prototype.selectPiece = function(pos){
  let piece = this.board.getPiece(pos)
  if (piece.color !== this.toMove){
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

View.prototype.flipBoard = function(){
  this.chessBoardDisplay.className = this.chessBoardDisplay.className === "chess-board" ?
    "chess-board black-to-move" : "chess-board"
}

View.prototype.flipClocks = function(){
  this.whiteClockDisplay.className = this.whiteClockDisplay.className === "to-move-clock clock-display" ?
    "just-moved-clock clock-display"  : "to-move-clock clock-display"
  this.blackClockDisplay.className = this.blackClockDisplay.className === "to-move-clock clock-display" ?
    "just-moved-clock clock-display"  : "to-move-clock clock-display"
}

View.prototype.renderWon = function(){
  this.changeToMove();
  let winner = this.toMove;
  let message = `${winner} WINS!`
  this.winMessageContent.innerHTML = message;
  this.winMessage.style.display = 'block';
  this.squareClickDisabled = true;
}


module.exports = View;
