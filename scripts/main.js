const View = require('./view');

document.addEventListener('DOMContentLoaded', function(){
  let mainEl = document.getElementById('root');
  new View(mainEl);
});
