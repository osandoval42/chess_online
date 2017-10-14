var express = require('express');
var path = require('path');

var flash = require('connect-flash');
import config from './config';



const app = express();
const db = config.configDB();

config.configRequestParser(app);
config.configViewEngine(app);
// config.configAuth(app);
// app.use(flash());
// app.use(function (req, res, next) {
//   res.locals.success_msg = req.flash('success_msg');
//   res.locals.error_msg = req.flash('error_msg');
//   res.locals.error = req.flash('error');
//   res.locals.user = req.user || null;
//   next();
// });
// setTimeout(function(){
// 	config.setupRoutes(app);
// }, 5000)




var http = require('http').Server(app);
var io = require('socket.io')(http); 
config.setupRoutes(app);
io.on('connection', function(socket){
  console.log('a user connected');
});
http.listen(3000, function(){
  console.log('Express listening on port', config.port);
});

// server.listen(config.port, config.host, () => {
//   console.info('Express listening on port', config.port);
// });