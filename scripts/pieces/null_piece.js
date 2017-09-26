const ChessUnicode = require('../constants/pieces_unicode');
const Colors = require('../constants/colors');
const Piece = require('./piece')

const NullPiece = function(pos){
  Piece.call(this);
  this.symbol = '';
  this.color = 'none';
  this.pos = pos;
};

NullPiece.prototype = Object.create(Piece.prototype);
NullPiece.prototype.constructor = NullPiece;

NullPiece.prototype.toString = function(){
  return `\" \"`;
}

NullPiece.prototype.moves = function(){
  return [];
};








module.exports = NullPiece;
