var jake = require( "jake" );

module.exports = function() {
  var cmds = [
              "uglifyjs --output dist/gladius.min.js dist/gladius.js"
              ];
  var callback = function() {
  };
  var opts = {
      stdout: true,
      stderr: true,
      breakOnError: false
  };

  jake.exec( cmds, callback, opts );
};
