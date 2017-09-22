const ChessUnicode = require('../constants/pieces_unicode');
const Colors = require('../constants/colors');
const Deltas = require('../constants/deltas');

const Bishop = function(color, pos, board){
  this.color = color;
  this.pos = pos;
  this.board = board;
  setUnicode.call(this)
  this.deltas = Deltas.DIAGONALS;
};

Bishop.prototype.moves = Deltas.slidingMoves;

Bishop.prototype.checkDirection = Deltas.checkDirection;

function setUnicode(){
  if (this.color === Colors.BLACK){
    this.symbol = ChessUnicode.BLACK_BISHOP;
  }
  else{
    this.symbol = ChessUnicode.WHITE_BISHOP;
  }
}

module.exports = Bishop;
