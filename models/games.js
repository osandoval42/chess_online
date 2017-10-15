var mongoose = require('mongoose');
import es6Promise from 'es6-promise';
mongoose.Promise = es6Promise.Promise;
const Board = require('../scripts/board');
const MoveResults = require('../scripts/constants/move_results');
let io;


const GameSchema = mongoose.Schema({ //REVISE img data
	gameId: {
		type: mongoose.Schema.Types.ObjectId,
		index: true
	},
	gameIsOver: {
		type: Boolean
	},
	won: {
		type: String
	},
	gameHasStarted: {
		type: Boolean
	},
	toMove: {
		type: String,
		trim: true
	},
	black: {
		type: String
	},
	white: {
		type: String
	},
	playerToMoveSecondsLeft: {
		type: Number
	},
	playerNotToMoveSecondsLeft: {
		type: Number
	},
	board: {
		type: String,
	}
}, {timestamps: true})

const Game = mongoose.model('Game', GameSchema);

/*
	grab currTime
	grab game with gameId, verify playerId is person to move.
	If either are errors return those

	convert board to object, attempt to make move.  {
		if invalid move, return corresponding error
		else check if time is good{
			If not save gameIsOver, return data
			else adjust time, switch players to move, make move, save board, and return data
		}
	}
*/	
Game.getNewBoard = function(origBoardJSON, newMoveData){
	//how to ensure good move data
	let board = Board.jsonToBoard(origBoardJSON);
	let moveResult = board.move(newMoveData.startPos, newMoveData.endPos);
	while (true){
		if (moveResult === MoveResults.SUCCESS){
			return board;
		} else if (moveResult === MoveResults.CHECKMATE){
			return {boardJSON: board.toJson(), checkmate: true}
		} else if (moveResult !== MoveResults.FAILURE){
			moveResult = this.board.makePromotion(moveResult, chosenPiece);
		} else {
			return undefined;
		}
	}
}

Game.numberfyPosition = function(pos){
	pos.row = Number(pos.row);
	pos.col = Number(pos.col);
}


Game.postMove = function(playerId, data, cb){
	Game.numberfyPosition(data.startPos);
	Game.numberfyPosition(data.endPos);
	
	let currDateInSeconds = new Date().getTime() / 1000;
	Game.findById(mongoose.Types.ObjectId(data.gameId), (err, currGame) => {
		if (err || currGame === undefined){return cb("Invalid Game ID")}
		let playerToMoveId = currGame.toMove === "white" ? currGame.white : currGame.black;
		if (playerId !== playerToMoveId){return cb("Invalid Player To Move ID");}


		let timeMoveWasGranted = (currGame.updatedAt || currGame.createdAt).getTime() / 1000;
		let secondsTakenToMove = currDateInSeconds - timeMoveWasGranted;
		let playerJustMovedSecondsLeft = currGame.playerToMoveSecondsLeft - secondsTakenToMove;

		if (playerJustMovedSecondsLeft > 0){
			let boardObj = Game.getNewBoard(currGame.board, data);
			

			if (boardObj === undefined){
				return cb("Invalid Move");
			} else if (boardObj.checkmate === true){
				currGame.board = boardObj.boardJSON;
				currGame.won = currGame.toMove;
				currGame.gameIsOver = true;
				currGame.save((err, savedGame) => {
					if (err){console.error(err); return cb(err);}
						let boardJSON = savedGame.board;
						let gameIsOver = savedGame.gameIsOver;
						let won = savedGame.won
						Game.emitNewGameState(savedGame)
						return cb(false, {boardJSON, gameIsOver, won})				
					})
			}
			currGame.board = boardObj.toJson();

			currGame.playerToMoveSecondsLeft = currGame.playerNotToMoveSecondsLeft;
			currGame.playerNotToMoveSecondsLeft = playerJustMovedSecondsLeft;			

			let toMove;
			let whiteSecondsLeft;
			let blackSecondsLeft;
			if (currGame.toMove === "white"){
				currGame.toMove = "black";
				toMove = "black"; //REVISE dont hardcode
				blackSecondsLeft = currGame.playerToMoveSecondsLeft;
				whiteSecondsLeft = currGame.playerNotToMoveSecondsLeft;
			} else {
				currGame.toMove = currGame.white;
				toMove = "white";
				whiteSecondsLeft = currGame.playerToMoveSecondsLeft;
				blackSecondsLeft = currGame.playerNotToMoveSecondsLeft;
			}
			currGame.save((err, savedGame) => {
				if (err){console.error(err); return cb(err);}
				let boardJSON = savedGame.board;
				let gameIsOver = savedGame.gameIsOver;
				let gameHasStarted = savedGame.gameHasStarted;
				Game.emitNewGameState(savedGame)
				return cb(false, {boardJSON, toMove, gameIsOver, gameHasStarted, whiteSecondsLeft, blackSecondsLeft})				
			})
		} else {
			currGame.gameIsOver = true;
			currGame.playerToMoveSecondsLeft = 0;
			currGame.save((err, savedGame) => {
				if (err){console.error(err); return cb(err);}

				let whiteSecondsLeft;
				let blackSecondsLeft;
				let gameIsOver = savedGame.gameIsOver;
				if (savedGame.toMove === savedGame.white){
					whiteSecondsLeft = 0;
					blackSecondsLeft = savedGame.playerNotToMoveSecondsLeft;
				} else {
					blackSecondsLeft = 0;
					whiteSecondsLeft = savedGame.playerNotToMoveSecondsLeft;
				}
				Game.emitNewGameState(savedGame)
				return cb(false, {gameIsOver, whiteSecondsLeft, blackSecondsLeft});
			})
		}
	})
}


Game.createGame = function(playerId, cb, seconds = 900){
	const newGame = new Game({
		gameIsOver: false,
		gameHasStarted: false,
		toMove: "white",
		playerToMoveSecondsLeft: seconds,
		playerNotToMoveSecondsLeft: seconds,
		board: Board.initializeBoard().toJson()
	})
	let playerColor;
	if (Math.random() >= .5){
		newGame.white = playerId
		playerColor = "white";
	} else{
		newGame.black = playerId
		playerColor = "black";
	}
	newGame.save((err, savedGame) => {
		if (err) {return cb(err);}
		let group = io.of(`/game-${savedGame['_id']}`)
		group.on('connection', function(socket){
  			console.log(`a user created group ${savedGame['_id']}`);
  		})

		Game.returnGameData(cb, savedGame, playerId);
	})
}

Game.joinGame = function(playerId, gameId, cb){
	Game.findById(mongoose.Types.ObjectId(gameId), (err, currGame) => {
		if (err || currGame === undefined){return cb("Invalid Game ID")}
		if (currGame.gameHasStarted === false){
			currGame.gameHasStarted = true;
			if (currGame.white === undefined){
				currGame.white = playerId
			} else {
				currGame.black = playerId;
			}
			currGame.save((err, savedGame) => {
				if (err || currGame === undefined){return cb("game failed to save")}
				Game.emitNewGameState(savedGame);
				Game.returnGameData(cb, currGame, playerId)
			})
		} else {
			if (currGame.black !== playerId && currGame.white !== playerId){
				return cb("you are not a player for this game")
			} else {
				Game.emitNewGameState(savedGame);
				return Game.returnGameData(cb, currGame, playerId);			
			}
		}
	})
}

Game.getGameJson = function(currGame, playerId){
	let whiteSecondsLeft;
	let blackSecondsLeft;
	if (currGame.toMove === "black"){
		blackSecondsLeft = currGame.playerToMoveSecondsLeft;
		whiteSecondsLeft = currGame.playerNotToMoveSecondsLeft;
	} else {
		whiteSecondsLeft = currGame.playerToMoveSecondsLeft;
		blackSecondsLeft = currGame.playerNotToMoveSecondsLeft;
	}	
	let json = {
		gameId: currGame._id,
		boardJSON: currGame.board,
		toMove: currGame.toMove,
		gameIsOver: currGame.gameIsOver,
		gameHasStarted: currGame.gameHasStarted,
		whiteSecondsLeft,
		blackSecondsLeft,
		won: currGame.won,
		playerColor: (currGame.white === playerId ? ("white") : ("black"))
	}
	return json
}

Game.emitNewGameState = function(savedGame){
	let group = io.of(`/game-${savedGame['_id']}`)
	console.log(`server group /game-${savedGame['_id']}`)
 	group.emit('new game state received', Game.getGameJson(savedGame));
}

Game.returnGameData = function(cb, currGame, playerId){
	let json = Game.getGameJson(currGame, playerId);
	cb(undefined, json);
}



Game.passIO = function(ioParam){
	io = ioParam;
	io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});
}



module.exports = Game;