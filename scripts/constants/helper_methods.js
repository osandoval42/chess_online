const HelperMethods = {
  arePositionsEqual: function(pos1, pos2){
    return (pos1.row === pos2.row && pos1.col === pos2.col);
  }
}

module.exports = HelperMethods
