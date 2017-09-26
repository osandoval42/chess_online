const ChessUnicode = require('../constants/pieces_unicode');
const Colors = require('../constants/colors');
const Deltas = require('../constants/deltas');
const Piece = require('./piece')

const Queen = function(color, pos, board){
  Piece.call(this);
  this.color = color;
  this.pos = pos;
  this.board = board;
  setUnicode.call(this);
  this.deltas = Deltas.DIAGONALS.concat(Deltas.NOTDIAGONALS);
};
Queen.prototype = Object.create(Piece.prototype);
Queen.prototype.constructor = Queen

Queen.prototype.moves = Deltas.slidingMoves;

Queen.prototype.checkDirection = Deltas.checkDirection;

Queen.prototype.toString = function(){
  return `\"${this.colorString()}Q\"`
}

function setUnicode(){
  if (this.color === Colors.BLACK){
    this.symbol = ChessUnicode.BLACK_QUEEN;
  }
  else{
    this.symbol = ChessUnicode.WHITE_QUEEN;
  }
}


module.exports = Queen;
