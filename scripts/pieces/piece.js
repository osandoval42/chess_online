const Colors = require('../constants/colors');
// const NullPiece = require('./null_piece');
// const Bishop = require('./bishop');
// const Knight = require('./knight');
// const Rook = require('./rook');
// const Pawn = require('./pawn');
// const King = require('./king');
// const Queen = require('./queen');

const Piece = function(){

}

Piece.prototype.colorString = function(){	
	return this.color === Colors.BLACK ? "B" : "W";
}



module.exports = Piece;