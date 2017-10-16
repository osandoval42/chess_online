var $ = require('jQuery');

const AppDispatcher = require('../dispatcher/dispatcher.js');

function receiveGameData(resp){
	//figure out what is sent down and s
	console.log(resp);
	// AppDispatcher.dispatch(payload);
}

const gameApi = {
	startGame: function(json, success, fail) {
		 $.ajax({
	      url: `/api/new_game`,
	      type: 'POST',
	      dataType: 'json',
	      data: json,	     
	      success,
	      error(xhr) {
	        console.log('error in startGame')
	     	 }
	    });
	},
	joinGame: function(gameId, success, fail) {
		 $.ajax({
	      url: `/api/joinGame/${gameId}`,
	      type: 'GET',	   
	      success,
	      error(xhr) {
	        console.log('error in joinGame')
	     	 }
	    });
	},
	makeMove: function(json){
		 $.ajax({
	      url: `/api/move`,
	      type: 'POST',
	      dataType: 'json',	
	      data: json,     
	      success: receiveGameData,
	      error(xhr) {
	        console.log('error in startGame')
	     	 }
	    });
	}
}

module.exports = gameApi;

