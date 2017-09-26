const ChessUnicode = require('../constants/pieces_unicode');
const Colors = require('../constants/colors');
const Deltas = require('../constants/deltas');
const Piece = require('./piece');

const Rook = function(color, pos, board){
  Piece.call(this);
  this.color = color;
  this.pos = pos;
  this.board = board;
  this.hasMoved = false;
  setUnicode.call(this);
  this.deltas = Deltas.NOTDIAGONALS;
};
Rook.prototype = Object.create(Piece.prototype);
Rook.prototype.constructor = Rook;

Rook.prototype.moves = Deltas.slidingMoves;

Rook.prototype.checkDirection = Deltas.checkDirection;

Rook.prototype.toString = function(){
  return `\"${this.colorString()}R\"`
}

function setUnicode(){
  if (this.color === Colors.BLACK){
    this.symbol = ChessUnicode.BLACK_ROOK;
  }
  else{
    this.symbol = ChessUnicode.WHITE_ROOK;
  }
}


module.exports = Rook;
