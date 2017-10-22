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
	playerToMoveMilliSecondsLeft: {
		type: Number
	},
	playerNotToMoveMilliSecondsLeft: {
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
			moveResult = board.makePromotion(moveResult, newMoveData.promotionPiece);
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
	console.log(`server hit with data ${JSON.stringify(data)}`);

	Game.numberfyPosition(data.startPos);
	Game.numberfyPosition(data.endPos);
	
	let currDateInMilliSeconds = new Date().getTime();
	Game.findById(mongoose.Types.ObjectId(data.gameId), (err, currGame) => {
		if (err || currGame === undefined || currGame === null){return cb("Invalid Game ID")}
		let playerToMoveId = currGame.toMove === "white" ? currGame.white : currGame.black;
		if (playerId !== playerToMoveId){return cb("Invalid Player To Move ID");}


		let timeMoveWasGranted = (currGame.updatedAt).getTime();
		let milliSecondsTakenToMove = currDateInMilliSeconds - timeMoveWasGranted;
		let playerJustMovedMilliSecondsLeft = currGame.playerToMoveMilliSecondsLeft - milliSecondsTakenToMove;

		if (playerJustMovedMilliSecondsLeft > 0){
			let boardObj = Game.getNewBoard(currGame.board, data);
			

			if (boardObj === undefined){
				return cb("Invalid Move");
			} else if (boardObj.checkmate === true){
				console.log("checkmate was made on server")
				currGame.board = boardObj.boardJSON;
				currGame.won = currGame.toMove;
				currGame.gameIsOver = true;
				return currGame.save((err, savedGame) => {
					if (err || savedGame === null || savedGame === undefined){console.error(err); return cb(err);}
						let boardJSON = savedGame.board;
						let gameIsOver = savedGame.gameIsOver;
						let won = savedGame.won
						console.log("XYZ")
						Game.emitNewGameState(savedGame)
						return cb(false, {boardJSON, gameIsOver, won})				
					})
			}
			currGame.board = boardObj.toJson();

			currGame.playerToMoveMilliSecondsLeft = currGame.playerNotToMoveMilliSecondsLeft;
			currGame.playerNotToMoveMilliSecondsLeft = playerJustMovedMilliSecondsLeft;			

			let toMove;
			let whiteMilliSecondsLeft;
			let blackMilliSecondsLeft;
			if (currGame.toMove === "white"){
				currGame.toMove = "black";
				toMove = "black"; //REVISE dont hardcode
				blackMilliSecondsLeft = currGame.playerToMoveMilliSecondsLeft;
				whiteMilliSecondsLeft = currGame.playerNotToMoveMilliSecondsLeft;
			} else {
				currGame.toMove = "white";
				toMove = "white";
				whiteMilliSecondsLeft = currGame.playerToMoveMilliSecondsLeft;
				blackMilliSecondsLeft = currGame.playerNotToMoveMilliSecondsLeft;
			}
			currGame.save((err, savedGame) => {
				if (err){console.error(err); return cb(err);}
				let boardJSON = savedGame.board;
				let gameIsOver = savedGame.gameIsOver;
				let gameHasStarted = savedGame.gameHasStarted;
				Game.emitNewGameState(savedGame)
				return cb(false, {boardJSON, toMove, gameIsOver, gameHasStarted, whiteMilliSecondsLeft, blackMilliSecondsLeft})				
			})
		} else {
			currGame.gameIsOver = true;
			currGame.playerToMoveMilliSecondsLeft = 0;
			currGame.save((err, savedGame) => {
				if (err){console.error(err); return cb(err);}

				let whiteMilliSecondsLeft;
				let blackMilliSecondsLeft;
				let gameIsOver = savedGame.gameIsOver;
				if (savedGame.toMove === savedGame.white){
					whiteMilliSecondsLeft = 0;
					blackMilliSecondsLeft = savedGame.playerNotToMoveMilliSecondsLeft;
				} else {
					blackMilliSecondsLeft = 0;
					whiteMilliSecondsLeft = savedGame.playerNotToMoveMilliSecondsLeft;
				}
				Game.emitNewGameState(savedGame)
				return cb(false, {gameIsOver, whiteMilliSecondsLeft, blackMilliSecondsLeft});
			})
		}
	})
}


Game.createGame = function(playerId, minutes, cb){
	const milliseconds = minutes * 60 * 1000;
	const newGame = new Game({
		gameIsOver: false,
		gameHasStarted: false,
		toMove: "white",
		playerToMoveMilliSecondsLeft: milliseconds,
		playerNotToMoveMilliSecondsLeft: milliseconds,
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
		let savedGameId = savedGame['_id']
		let group = io.of(`/game-${savedGameId}`)
		group.on('connection', function(socket){
  			console.log(`a user joined group ${savedGameId}`);
  			Game.emitGameDataOnNewConnection(savedGameId)
  		})
  		group.on('reconnect', () => {
  			console.log('a user reconnected');
  			Game.emitGameDataOnNewConnection(savedGameId)

  		})

		Game.returnGameDataWithPlayerColor(cb, savedGame, playerId);
	})
}

Game.emitGameDataOnNewConnection = function(savedGameId){
		Game.findById(savedGameId, (err, currGame) => {
			if (err){return console.error(`error in reconnect ${err}`)}

			Game.emitNewGameState(currGame);
		})
}

Game.joinGame = function(playerId, gameId, cb){
	Game.findById(mongoose.Types.ObjectId(gameId), (err, currGame) => {
		if (err || currGame === undefined || currGame === null){return cb("Invalid Game ID")}
		if (currGame.gameHasStarted === false){
			if (currGame.white === playerId || currGame.black === playerId){
				return Game.returnGameDataWithPlayerColor(cb, currGame, playerId);
			}

			currGame.gameHasStarted = true;
			if (currGame.white === undefined){
				currGame.white = playerId
			} else {
				currGame.black = playerId;
			}
			currGame.save((err, savedGame) => {
				if (err || savedGame === undefined || savedGame === null){return cb("game failed to save")}
				Game.emitNewGameState(savedGame);
				Game.returnGameDataWithPlayerColor(cb, currGame, playerId)
			})
		} else {
			if (currGame.black !== playerId && currGame.white !== playerId){
				console.error(`invalid player id with playerId: ${playerId}, black:${currGame.black}, white:${currGame.white}`)
				return cb("you are not a player for this game")
			} else {
				Game.emitNewGameState(currGame);
				return Game.returnGameDataWithPlayerColor(cb, currGame, playerId);			
			}
		}
	})
}

Game.getGameJson = function(currGame, playerId){
	let whiteMilliSecondsLeft;
	let blackMilliSecondsLeft;
	if (currGame.toMove === "black"){
		blackMilliSecondsLeft = currGame.playerToMoveMilliSecondsLeft;
		whiteMilliSecondsLeft = currGame.playerNotToMoveMilliSecondsLeft;
	} else {
		whiteMilliSecondsLeft = currGame.playerToMoveMilliSecondsLeft;
		blackMilliSecondsLeft = currGame.playerNotToMoveMilliSecondsLeft;
	}	

	let playerToMoveMilliSecondsLeft = currGame.playerToMoveMilliSecondsLeft;
	if (currGame.gameHasStarted){
		let timeElapsedSinceMoveChanged = (new Date().getTime() - (currGame.updatedAt).getTime())
		playerToMoveMilliSecondsLeft -= timeElapsedSinceMoveChanged;
	}
	
	let json = {
		gameId: currGame._id,
		boardJSON: currGame.board,
		toMove: currGame.toMove,
		gameIsOver: currGame.gameIsOver,
		gameHasStarted: currGame.gameHasStarted,
		playerToMoveMilliSecondsLeft,
		playerNotToMoveMilliSecondsLeft: currGame.playerNotToMoveMilliSecondsLeft,
		whiteMilliSecondsLeft,
		blackMilliSecondsLeft,
		won: currGame.won,		
	}
	//playerColor: (currGame.white === playerId ? ("white") : ("black"))
	return json
}

Game.emitNewGameState = function(savedGame){
	let group = io.of(`/game-${savedGame['_id']}`)
	// console.log(`server group /game-${savedGame['_id']}`)
 	group.emit('new game state received', Game.getGameJson(savedGame));
}

Game.returnGameDataWithPlayerColor = function(cb, currGame, playerId){
	let json = Game.getGameJson(currGame, playerId);
	json.playerColor = playerId === currGame.white ? "white" : "black";
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