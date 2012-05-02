var jake = require( "jake" );

module.exports = function( files ) {
  files = (files && files.length > 0) ? files : ["."];
  var cmds = [
              "jake -T"
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
