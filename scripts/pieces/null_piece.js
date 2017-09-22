const ChessUnicode = require('../constants/pieces_unicode');
const Colors = require('../constants/colors');

const NullPiece = function(pos){
  this.symbol = '';
  this.color = 'none';
  this.pos = pos;
};

NullPiece.prototype.moves = function(){
  return [];
};







module.exports = NullPiece;
