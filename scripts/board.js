const NullPiece = require('./pieces/null_piece');
const Bishop = require('./pieces/bishop');
const Knight = require('./pieces/knight');
const Rook = require('./pieces/rook');
const Pawn = require('./pieces/pawn');
const King = require('./pieces/king');
const Queen = require('./pieces/queen');
const Piece = require('./pieces/piece');
const COLORS = require('./constants/colors');
const MoveResults = require('./constants/move_results');
const HelperMethods = require('./constants/helper_methods');

const ongoingGameStore = require('./stores/ongoing_game_store');

const Board = function(){

};

Board.initializeBoard = function(){
  //toMove is in view
  let gameData = ongoingGameStore.gameData()
  let currBoard;
  if (gameData.boardJSON === undefined){
    currBoard = Board.initializeFreshBoard()
    ongoingGameStore.addBoard(currBoard.toJson());
  } else {
    currBoard = Board.jsonToBoard(gameData.boardJSON);
  }
  return currBoard;
}

Board.initializeFreshBoard = function(){
  let freshBoard = new Board();
  freshBoard.grid = new Array(8);

  for (let rowIdx = 0; rowIdx < 8; rowIdx++){
    freshBoard.grid[rowIdx] = new Array(8);
    for (let colIdx = 0; colIdx < 8; colIdx++){
      freshBoard.grid[rowIdx][colIdx] = new NullPiece({row: rowIdx, col:colIdx});
    }
  }

  freshBoard.whitePawns = [];
  freshBoard.blackPawns = [];
  placePawns.call(freshBoard, COLORS.BLACK, 1);
  placePawns.call(freshBoard, COLORS.WHITE, 6);

  placeMajors.call(freshBoard, COLORS.BLACK, 0);
  placeMajors.call(freshBoard, COLORS.WHITE, 7);

  //DElETE
  // let json = freshBoard.toJson();
  // console.log(json)
  // console.log('now for the piece check')
  // let boardTest = Board.jsonToBoard(json);
  // json = boardTest.toJson();
  // console.log('now for the piece check')
  // console.log(json);

  return freshBoard;
  // return boardTest;
}

Board.prototype.toJson = function(){
  let json = "[";

  this.grid.forEach((row, rowIdx) => {
    json += "[";

    row.forEach((piece, i) => {
      json += piece.toString();
      json += (i === row.length - 1) ? ']' : ', '
    })
    if (rowIdx < this.grid.length - 1){
      json += ', ';
    }
  })

  json += ']';
  return json;
}

Board.jsonToBoard = function(jsonBoard){
  let restoredBoard = new Board();
  restoredBoard.whitePawns = [];
  restoredBoard.blackPawns = [];
  restoredBoard.grid = [];
  let jsonObj = JSON.parse(jsonBoard);
  jsonObj.forEach((jsonRow, rowIdx) => {
    restoredBoard.grid.push([]);
    jsonRow.forEach((pieceString, colIdx) => {
      let piece = this.stringToPiece(pieceString, {row: rowIdx, col: colIdx}, restoredBoard);
      restoredBoard.grid[rowIdx].push(piece);
      if (piece.constructor === Pawn){
        let pawnsArr = piece.color === COLORS.WHITE ? restoredBoard.whitePawns : restoredBoard.blackPawns;
        pawnsArr.push(piece);
      }
    })
  })
  return restoredBoard;
}

Board.stringToPiece = function(str, pos, board){
  let colorLetter = str[0];
  let color;
  if (colorLetter === " "){
    return new NullPiece(pos)
  } else {
    color = colorLetter === "B" ? COLORS.BLACK : COLORS.WHITE;
  }
  let pieceLetter = str[1];
  let res;
  switch (pieceLetter){
    case "Q": res = new Queen(color, pos, board); break;
    case "N": res = new Knight(color, pos, board); break;
    case "K": res = new King(color, pos, board); break;
    case "B": res = new Bishop(color, pos, board); break;
    case "P": res = new Pawn(color, pos, board); break;
    case "p": res = new Pawn(color, pos, board); break;
    case "R": res = new Rook(color, pos, board); break;
    default: throw `invalid piece str with ${str}`;
  }
  if (pieceLetter === 'p'){
    res.enpassantOption = {move: {row: Number(str[2]), col: Number(str[3])}}
  }
  return res;
}

Board.prototype.flattenedGrid = function(){
  return Array.prototype.concat.apply([], this.grid);
}

function placePawns(color, rowIdx){
  let pawnsArr = color === COLORS.WHITE ? this.whitePawns : this.blackPawns

  this.grid[rowIdx].forEach((_, colIdx) => {
    this.grid[rowIdx][colIdx] = new Pawn(color, {row: rowIdx, col: colIdx}, this);
    pawnsArr.push(this.grid[rowIdx][colIdx]);
  });
}

Board.prototype.nullifyEnpassantOptions = function(colorJustMoved){
  let pawnsArr = colorJustMoved === COLORS.WHITE ? this.whitePawns : this.blackPawns

  pawnsArr.forEach(function(pawn){
    pawn.enpassantOption = null;
  })
}

function placeMajors(color, rowIdx){
  this.grid[rowIdx][0] = new Rook(color, {row: rowIdx, col: 0}, this);
  this.grid[rowIdx][7] = new Rook(color, {row: rowIdx, col: 7}, this);

  this.grid[rowIdx][1] = new Knight(color, {row: rowIdx, col: 1}, this);
  this.grid[rowIdx][6] = new Knight(color, {row: rowIdx, col: 6}, this);

  this.grid[rowIdx][2] = new Bishop(color, {row: rowIdx, col: 2}, this);
  this.grid[rowIdx][5] = new Bishop(color, {row: rowIdx, col: 5}, this);

  this.grid[rowIdx][3] = new Queen(color, {row: rowIdx, col: 3}, this);
  this.grid[rowIdx][4] = new King(color, {row: rowIdx, col: 4}, this);
}


Board.prototype.getPiece = function(pos){
  return this.grid[pos.row][pos.col];
};

Board.prototype.castle = function(king, endCoords){ //need to return success failure or checkmate
  if ((king.color === COLORS.WHITE && endCoords.col === 6 && endCoords.row === 7) ||
      (king.color === COLORS.BLACK && endCoords.col === 6 && endCoords.row === 0)){
    return this.kingSideCastle(king);
  }
  if ((king.color === COLORS.WHITE && endCoords.col === 2 && endCoords.row === 7) ||
    (king.color === COLORS.BLACK && endCoords.col === 2 && endCoords.row === 0)) {
    return this.queenSideCastle(king);
  }

  return MoveResults.FAILURE;
}

Board.prototype.kingSideCastle = function(king){
  let kingRow = king.pos.row

  let rook = this.getPiece({row: kingRow, col: 7});
  if (rook.hasMoved || king.hasMoved){
    return MoveResults.FAILURE;
  }
  let bishopSquare = this.getPiece({row: kingRow, col: 5})
  let knightSquare = this.getPiece({row: kingRow, col: 6})

  if (bishopSquare.constructor !== NullPiece || knightSquare.constructor!== NullPiece){
    return MoveResults.FAILURE;
  }

  if (this.isInCheck(king.color)){
    return MoveResults.FAILURE;
  }

  if (this.wouldBeInCheckAfterMove(king.pos, bishopSquare.pos)){
    return MoveResults.FAILURE;
  }

  if (this.wouldBeInCheckAfterMove(king.pos, knightSquare.pos)){
    return MoveResults.FAILURE;
  }

  this.movePiece(king, knightSquare.pos);
  return this.actualMove(rook.pos, bishopSquare.pos);
}

Board.prototype.queenSideCastle = function(king){
  let kingRow = king.pos.row;
  let rook = this.getPiece({row: kingRow, col: 0});
  if (rook.hasMoved || king.hasMoved){
    return MoveResults.FAILURE;
  }

  let queenSquare = this.getPiece({row: kingRow, col: 3})
  let bishopSquare = this.getPiece({row: kingRow, col: 2})
  let knightSquare = this.getPiece({row: kingRow, col: 1})

  if (bishopSquare.constructor !== NullPiece || knightSquare.constructor!== NullPiece ||
   queenSquare.constructor !== NullPiece){
    return MoveResults.FAILURE;
  }

  if (this.isInCheck(king.color)){
    return MoveResults.FAILURE;
  }

  if (this.wouldBeInCheckAfterMove(king.pos, bishopSquare.pos)){
    return MoveResults.FAILURE;
  }

  if (this.wouldBeInCheckAfterMove(king.pos, queenSquare.pos)){
    return MoveResults.FAILURE;
  }

  this.movePiece(king, bishopSquare.pos);
  return this.actualMove(rook.pos, queenSquare.pos);
}

Board.prototype.move = function(startCoords, endCoords){
  const movingPiece = this.getPiece(startCoords)

  if (movingPiece.constructor === King &&
    Math.abs(startCoords.col - endCoords.col) === 2 &&
    startCoords.row === endCoords.row){
    return this.castle(movingPiece, endCoords);
  }

  if (this.isValidMove(movingPiece, endCoords)){
    return this.actualMove(startCoords, endCoords);
  } else{

      if (movingPiece.constructor === Pawn && Math.abs(startCoords.col - endCoords.col) === 1){
        return this.tryEnpassant(movingPiece, endCoords);
      }

    return MoveResults.FAILURE;
  }
};

Board.prototype.tryEnpassant = function(pawn, endCoords){
  if (pawn.enpassantOption === null){
    return MoveResults.FAILURE;
  }

  if (HelperMethods.arePositionsEqual(endCoords, pawn.enpassantOption.move)){
    let pawnTakenPos = {row: endCoords.row, col: endCoords.col}
    pawnTakenPos.row += (pawn.color === COLORS.WHITE ? 1 : -1);

    this.grid[pawnTakenPos.row][pawnTakenPos.col] = new NullPiece(pawnTakenPos)

    return this.actualMove(pawn.pos, endCoords);

  } else{

    return MoveResults.FAILURE;
  }
}

Board.prototype.actualMove = function(startCoords, endCoords){
  const movingPiece = this.getPiece(startCoords)
  movingPiece.hasMoved = true;
  this.nullifyEnpassantOptions(movingPiece.color);

  this.movePiece(movingPiece, endCoords);

  if (movingPiece.constructor === Pawn){
    if (endCoords.row === 7 || endCoords.row === 0){
      return endCoords;
    }

    if (Math.abs(endCoords.row - startCoords.row) === 2){
      let targetRow = startCoords.row > endCoords.row ? (endCoords.row + 1) : (startCoords.row + 1);
      this.giveEnpassantOption(targetRow, endCoords);
    }
  }

  if (this.isInCheckMate(movingPiece.color)){
    return MoveResults.CHECKMATE;
  }

  return MoveResults.SUCCESS;
};

Board.prototype.giveEnpassantOption = function(targetRow, endCoords){
  let targetPawn = this.getPiece(endCoords)
  if (endCoords.col > 0){
    let leftPiece = this.getPiece({row: endCoords.row, col: endCoords.col - 1})
    if (leftPiece.constructor === Pawn && leftPiece.color !== targetPawn.color){
      leftPiece.enpassantOption = {targetPawn: targetPawn,
        move: {row: targetRow, col: targetPawn.pos.col}}
    }
  }

  if (endCoords.col < 7){
    let rightPiece = this.getPiece({row: endCoords.row, col: endCoords.col + 1})
    if (rightPiece.constructor === Pawn && rightPiece.color !== targetPawn.color){
      rightPiece.enpassantOption = {targetPawn: targetPawn,
        move: {row: targetRow, col: targetPawn.pos.col}}
    }
  }
};

Board.prototype.makePromotion = function(pos, piece){
  let pieceConstructor = this.determinePieceConstructor(piece)
  const pawnToPromote = this.getPiece(pos)
  this.grid[pos.row][pos.col] = new pieceConstructor(pawnToPromote.color, pos, this);
  if (this.isInCheckMate(pawnToPromote.color)){
    return MoveResults.CHECKMATE;
  }
  else{
    return MoveResults.SUCCESS;
  }
}

Board.prototype.determinePieceConstructor = function(piece){
  switch (piece){
    case 'Rook':{
      return Rook;
    }
    case 'Knight':{
      return Knight;
    }
    case 'Bishop':{
      return Bishop;
    }
    case 'Queen':{
      return Queen;
    }
  }
}

Board.prototype.isInCheckMate = function(checkingColor){
  const checkedColor = checkingColor === COLORS.BLACK ? COLORS.WHITE : COLORS.BLACK;
  if (!this.isInCheck(checkedColor)){
    return false;
  }

  const moves = this.movesByColor(checkedColor);
  const hasNoValidMove = !moves.some((move) =>{
    return !this.wouldBeInCheckAfterMove(move.startCoords, move.endCoords)
  })

  return hasNoValidMove;
};

Board.prototype.movePiece = function(movingPiece, endCoords){
  this.grid[movingPiece.pos.row][movingPiece.pos.col] = new NullPiece(movingPiece.pos);
  movingPiece.pos = endCoords;
  this.grid[endCoords.row][endCoords.col] = movingPiece;
}

Board.prototype.isValidMove = function(movingPiece, endCoords){
  if (!movingPiece.moves().some((move) => {
    return HelperMethods.arePositionsEqual(endCoords, move);
  })){
    return false;
  }

  return !this.wouldBeInCheckAfterMove(movingPiece.pos, endCoords);
}

Board.prototype.wouldBeInCheckAfterMove = function(startCoords, endCoords){
  const toPlaceBack = this.getPiece(endCoords);
  const movingPiece = this.getPiece(startCoords);
  this.movePiece(movingPiece, endCoords);

  const inCheckAfterMove = this.isInCheck(movingPiece.color);

  this.movePiece(movingPiece, startCoords);
  this.movePiece(toPlaceBack, endCoords)

  return inCheckAfterMove;
}

Board.prototype.renderPieces = function(squares){
  this.grid.forEach(function(row, rowIdx){
    row.forEach(function(piece, colIdx){
      let squareIdx = 8 * rowIdx + colIdx;
      squares[squareIdx].innerHTML = piece.symbol;
    });
  });
};

Board.prototype.isInRange = function(pos){
  if (pos.row < 0 || pos.row > 7 || pos.col < 0 || pos.col > 7){
    return false;
  }
  else {
    return true;
  }
}

Board.prototype.isInCheck = function(checkedColor){
  const checkingColor = checkedColor === COLORS.BLACK ? COLORS.WHITE : COLORS.BLACK;
  const checkingMoves = this.movesByColor(checkingColor);
  const checkedKing = this.findKingByColor(checkedColor);

  return checkingMoves.some((move) => {
    return HelperMethods.arePositionsEqual(move.endCoords, checkedKing.pos);
  })
}

Board.prototype.movesByColor = function(color){
  let squares = this.flattenedGrid()
  const totalMovesByColor = squares.reduce((totalMoves, square) =>{
    if (square.color === color){
      const endCoords = square.moves();
      const moves = endCoords.map(function(endCoord){
        return {startCoords: square.pos, endCoords: endCoord};
      })

      totalMoves = totalMoves.concat(moves)
    }
    return totalMoves;
  }, [])

  return totalMovesByColor;
}

Board.prototype.findKingByColor = function(color){
  let squares = this.flattenedGrid()
  for (let i = 0; i < squares.length; i++){
    if (squares[i].constructor === King && squares[i].color === color){
      return squares[i];
    }
  }
}

module.exports = Board;
