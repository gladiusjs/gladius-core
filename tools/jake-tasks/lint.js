module.exports = function( files ) {
  files = (files && files.length > 0) ? files : ["."];
  var cmds = [
              "jshint " + files.join( ' ' )
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
