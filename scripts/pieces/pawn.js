const ChessUnicode = require('../constants/pieces_unicode');
const Colors = require('../constants/colors');

const Pawn = function(color, pos, board){
  this.color = color;
  this.enpassantOption = null;
  this.pos = pos;
  this.board = board
  this.hasMoved = false;
  this.firstMoveDelta = {row: 0, col: 0};
  this.delta = {row: 0, col: 0}
  this.killDeltas = [
    {row: 0, col: 1},
    {row: 0, col: -1}
  ]

  if (this.color === Colors.BLACK){
    this.delta.row++;
    this.firstMoveDelta.row += 2;
    this.killDeltas.forEach((killDelta) => {
      killDelta.row++;
    })
  }
  else{
    this.delta.row--;
    this.firstMoveDelta.row -= 2;
    this.killDeltas.forEach((killDelta) => {
      killDelta.row--;
    })
  }
  setUnicode.call(this);
};

Pawn.prototype.moves = function(){
  let moves = [];

  this.pushKillMoves(moves)

  let frontMove = {
    row: this.pos.row + this.delta.row,
    col: this.pos.col + this.delta.col
  };
  let inFront = this.board.getPiece(frontMove);
  if (inFront.color !== 'none'){
    return moves;
  }

  moves.push(frontMove);

  if (this.hasMoved === false){
    this.pushJumpMove(moves);
  }

  return moves;
}

Pawn.prototype.pushKillMoves = function(moves){
  this.killDeltas.forEach((killDelta) => {
    let newMove = {
      row: this.pos.row + killDelta.row,
      col: this.pos.col + killDelta.col
    };

    if (!this.board.isInRange(newMove)){
      return;
    }
    let targetSquare = this.board.getPiece(newMove);
    if (targetSquare.color !== 'none' && targetSquare.color !== this.color){
      moves.push(newMove);
    }
  })
  return moves;
}

Pawn.prototype.pushJumpMove = function(moves){
  let jumpMove = {
    row: this.pos.row + this.firstMoveDelta.row,
    col: this.pos.col + this.firstMoveDelta.col
  };

  let twoAhead = this.board.getPiece(jumpMove);
  if (twoAhead.color !== 'none'){
    return moves;
  }
  else {
    moves.push(jumpMove);
    return moves;
  }
}


function setUnicode(){
  if (this.color === Colors.BLACK){
    this.symbol = ChessUnicode.BLACK_PAWN;
  }
  else{
    this.symbol = ChessUnicode.WHITE_PAWN;
  }
}


module.exports = Pawn;
