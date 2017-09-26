const ChessUnicode = require('../constants/pieces_unicode');
const Colors = require('../constants/colors');
const Deltas = require('../constants/deltas');
const Piece = require('./piece')

const King = function(color, pos, board){
  Piece.call(this);
  this.color = color;
  this.pos = pos;
  this.board = board;
  this.hasMoved = false;
  setUnicode.call(this)
  this.stepDeltas = [
    {row: 1, col:-1},
    {row: 1, col:0},
    {row: 1, col:1},
    {row: 0, col:-1},
    {row: 0, col:1},
    {row: -1, col:-1},
    {row: -1, col:0},
    {row: -1, col:1}
  ]
};

King.prototype = Object.create(Piece.prototype);
King.prototype.constructor = King

King.prototype.toString = function(){
  return `\"${this.colorString()}K\"`
}

King.prototype.moves = Deltas.steppingMoves;


function setUnicode(){
  if (this.color === Colors.BLACK){
    this.symbol = ChessUnicode.BLACK_KING;
  }
  else{
    this.symbol = ChessUnicode.WHITE_KING;
  }
}


module.exports = King;
