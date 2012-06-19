module.exports = function() {
  var cmds = [
              "uglifyjs --output dist/gladius-core.min.js dist/gladius-core.js"
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
