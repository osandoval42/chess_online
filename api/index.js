import express from 'express';
import es6Promise from 'es6-promise';
import Game from '../models/games';

let router = express.Router();

router.post('/move', (req, res) => {
	let gameId = req.gameId;
	let playerId = req.playerId
	Game.postMove(gameId, playerId, (error, newGameData) => {
		if (error){
			return res.status(401).send({"ok": false, error}); 
		} else {
			res.send(newGameData)
		}
	})
})

module.exports = router;

/*
{
	boardJSON:
	playerId:
	currPlayerToMove:
	
	currPlayerSecondsLeft:
	OpponentSecondsLeft:
	gameIsOver:
	gameHasStarted:

}
*/