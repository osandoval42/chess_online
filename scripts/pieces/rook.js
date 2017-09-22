const ChessUnicode = require('../constants/pieces_unicode');
const Colors = require('../constants/colors');
const Deltas = require('../constants/deltas');

const Rook = function(color, pos, board){
  this.color = color;
  this.pos = pos;
  this.board = board;
  this.hasMoved = false;
  setUnicode.call(this);
  this.deltas = Deltas.NOTDIAGONALS;
};

Rook.prototype.moves = Deltas.slidingMoves;

Rook.prototype.checkDirection = Deltas.checkDirection;


function setUnicode(){
  if (this.color === Colors.BLACK){
    this.symbol = ChessUnicode.BLACK_ROOK;
  }
  else{
    this.symbol = ChessUnicode.WHITE_ROOK;
  }
}


module.exports = Rook;
