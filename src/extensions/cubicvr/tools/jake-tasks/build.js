var jake = require( "jake" );

module.exports = function() {
  var cmds = [
              "node tools/r.js -o tools/build.js",
              "uglifyjs --output dist/gladius-cubicvr.min.js dist/gladius-cubicvr.js"
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
