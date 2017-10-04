var mongoose = require('mongoose');
import es6Promise from 'es6-promise';
mongoose.Promise = es6Promise.Promise;


const GameSchema = mongoose.Schema({ //REVISE img data
	gameId: {
		type: mongoose.Schema.Types.ObjectId,
		index: true
	},
	gameIsOver: {
		type: Boolean
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
Game.postMove = function(gameId, playerId, cb){
	let currDateInSeconds = new Date().getTime() / 1000;
	Game.findById(mongoose.Types.ObjectId(gameId), (err, currGame) => {
		if (err){return cb("Invalid Game ID")}
		if (playerId !== currGame.toMove){return cb("Invalid Player To Move ID");}
		//make board into obj LEFT OFF
		//check if move is valid, if so make move else dont

		let timeMoveWasGranted = (currGame.updatedAt || currGame.createdAt).getTime() / 1000;
		let secondsTakenToMove = currDateInSeconds - timeMoveWasGranted;
		let playerJustMovedSecondsLeft = currGame.playerToMoveSecondsLeft - secondsTakenToMove;

		if (playerJustMovedSecondsLeft > 0){
			currGame.playerToMoveSecondsLeft = currGame.playerNotToMoveSecondsLeft;
			currGame.playerNotToMoveSecondsLeft = playerJustMovedSecondsLeft;			
			currGame.board = boardObj.toJson();

			let toMove;
			let whiteSecondsLeft;
			let blackSecondsLeft;
			if (currGame.toMove === currGame.white){
				currGame.toMove = currGame.black;
				toMove = "BLACK"; //REVISE dont hardcode
				blackSecondsLeft = currGame.playerToMoveSecondsLeft;
				whiteSecondsLeft = currGame.playerNotToMoveSecondsLeft;
			} else {
				currGame.toMove = currGame.white;
				toMove = "WHITE";
				whiteSecondsLeft = currGame.playerToMoveSecondsLeft;
				blackSecondsLeft = currGame.playerNotToMoveSecondsLeft;
			}
			currGame.save((err, savedGame) => {
				if (err){console.error(err); return cb(err);}
				let boardJSON = savedGame.board;
				let gameIsOver = savedGame.gameIsOver;
				let gameHasStarted = savedGame.gameHasStarted;
				return cb(false, {boardJSON, playerId, toMove, gameIsOver, gameHasStarted, whiteSecondsLeft, blackSecondsLeft})				
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

				return cb(false, {gameIsOver, whiteSecondsLeft, blackSecondsLeft});
			})
		}
	})
}

module.exports = Game;