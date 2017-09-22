const ChessUnicode = require('../constants/pieces_unicode');
const Colors = require('../constants/colors');
const Deltas = require('../constants/deltas');

const King = function(color, pos, board){
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
