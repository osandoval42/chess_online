const ChessUnicode = require('../constants/pieces_unicode');
const Colors = require('../constants/colors');
const Deltas = require('../constants/deltas');
const Piece = require('./piece')

const Knight = function(color, pos, board){
  Piece.call(this);
  this.color = color;
  this.pos = pos;
  this.board = board;
  setUnicode.call(this)
  this.stepDeltas = [
    {row: -2, col: 1},
    {row: -2 , col: -1},
    {row: 2 , col: 1},
    {row: 2, col: -1},
    {row: -1, col: 2},
    {row: 1, col: 2},
    {row: -1, col: -2},
    {row: 1, col: -2}
  ]

};

Knight.prototype = Object.create(Piece.prototype);
Knight.prototype.constructor = Knight

Knight.prototype.toString = function(){
  return `\"${this.colorString()}N\"`
}

Knight.prototype.moves = Deltas.steppingMoves;


function setUnicode(){
  if (this.color === Colors.BLACK){
    this.symbol = ChessUnicode.BLACK_KNIGHT;
  }
  else{
    this.symbol = ChessUnicode.WHITE_KNIGHT;
  }
}


module.exports = Knight;
