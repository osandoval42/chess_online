var express = require('express');
var path = require('path');

var flash = require('connect-flash');
import config from './config';

const server = express();
const db = config.configDB();

config.configRequestParser(server);
config.configViewEngine(server);
// config.configAuth(server);
// server.use(flash());
// server.use(function (req, res, next) {
//   res.locals.success_msg = req.flash('success_msg');
//   res.locals.error_msg = req.flash('error_msg');
//   res.locals.error = req.flash('error');
//   res.locals.user = req.user || null;
//   next();
// });
config.setupRoutes(server);
server.listen(config.port, config.host, () => {
  console.info('Express listening on port', config.port);
});