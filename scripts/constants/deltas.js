const Deltas = {
  DIAGONALS: [
    {row: -1, col: -1},
    {row: 1, col: 1},
    {row: -1, col: 1},
    {row: 1, col: -1}
  ],
  NOTDIAGONALS:[
    {row: 0, col: -1},
    {row: 0, col: 1},
    {row: -1, col: 0},
    {row: 1, col: 0}
  ],
  slidingMoves: function(){
    let moves = [];

    this.deltas.forEach((delta) => {
      this.checkDirection(moves, delta);
    })

    return moves;
  },
  checkDirection: function(moves, delta){
    let newMove = {};
    newMove.row = this.pos.row + delta.row;
    newMove.col = this.pos.col + delta.col;
    while(this.board.isInRange(newMove)){
      let piece = this.board.getPiece(newMove);
      if (piece.color === 'none'){
        moves.push(newMove);
      }
      else if (piece.color === this.color){
        return moves;
      }
          else {
            moves.push(newMove);
            return moves;
          }

      let nextNewMove = {
        row: newMove.row + delta.row,
        col: newMove.col + delta.col
      };
      newMove = nextNewMove;
    }
  },

  steppingMoves: function(){
    let moves = [];
    this.stepDeltas.forEach(function(delta) {
      let newMove = {row: this.pos.row + delta.row, col: this.pos.col + delta.col};
      if (!this.board.isInRange(newMove)){
        return;
      }
      let targetSquare = this.board.getPiece(newMove)
      if (targetSquare.color !== this.color){
        moves.push(newMove);
      }
    }, this)

    return moves;
  }
}

module.exports = Deltas;
