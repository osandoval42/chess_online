import express from 'express';
import es6Promise from 'es6-promise';
import Game from '../models/games';
import config from '../config';
// const io = config.io;

let router = express.Router();

function getCookie(req, res){
	if (req.cookies.playerId === undefined){
		let rand = Math.random().toString()
		let playerId = rand.substring(2,rand.length);
		res.cookie('playerId', playerId, { maxAge: 900000, httpOnly: true });
		return playerId;
	} else {
		return req.cookies.playerId;
	}
}

router.post('/move', (req, res) => {
	let playerId = req.cookies.playerId
	Game.postMove(playerId, req.body, (error, newGameData) => {
		if (error){
			return res.status(401).send({"ok": false, error}); 
		} else {
			res.send(newGameData)
		}
	})
})

router.post('/new_game', (req, res) => {
	let playerId = getCookie(req, res);

	Game.createGame(playerId, req.body.minutes, (error, newGameData) => {
		if (error){
			return res.status(401).send({"ok": false, error}); 
		} else {
			res.send(newGameData)
		}
	})
})
router.get('/joinGame/:gameId', (req, res) => {
	let playerId = getCookie(req, res);
	let gameId = req.params.gameId
	Game.joinGame(playerId, gameId, (error, newGameData) => {
		if (error){
			return res.status(401).send({"ok": false, error}); 
		} else {
			res.send(newGameData)
		}
	})
})

// let users = [];
// let connections = [];
// io.sockets.on('connection', function(socket){
// 	connections.push(socket);
// 	console.log(`connected ${connections.length} sockets`)
// 	socket.on('disconnect', function(data){
// 		connections.splice(connections.indexOf(socket), 1);
// 		console.log(`disconnected ${connections.length} sockets`)
// 	})

// 	socket.on('make move', function(){
// 		console.log('move made');
// 		//check which socket this depends on 
// 		io.sockets.emit('new move', {move: ''});
// 	})
// })
//on join game stop person from playing from same browser

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