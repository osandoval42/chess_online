const ChessUnicode = require('../constants/pieces_unicode');
const Colors = require('../constants/colors');
const Deltas = require('../constants/deltas');
const Piece = require('./piece')

const Bishop = function(color, pos, board){
  Piece.call(this);
  this.color = color;
  this.pos = pos;
  this.board = board;
  setUnicode.call(this)
  this.deltas = Deltas.DIAGONALS;
};
Bishop.prototype = Object.create(Piece.prototype);
Bishop.prototype.constructor = Bishop

Bishop.prototype.toString = function(){
  return `\"${this.colorString()}B\"`
}

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
