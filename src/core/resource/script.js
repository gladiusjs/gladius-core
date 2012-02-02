/*jshint white: false, strict: false, plusplus: false, onevar: false,
 nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define(function(require) {

  var Resource = require('base/resource');

  var Script = new Resource({
    type : 'Script'
  }, function(data) {

    var _script = new Function(['parameters'], 'var f = ' + data + '; return f.apply( null, parameters );');

    this.run = function() {
      return _script.apply(null, [Array.prototype.slice.call(arguments)]);
    };
  });
  return Script;

});
