/*jshint white: false, strict: false, plusplus: false */
/*global define: false */

define( function ( require ) {

  var numDummies = 0;

  function dummy( options ) {

    options = options || {};

    ++numDummies;
    var init = options.init || false;

    this.dummy = function ( value ) {
      init = value || !init;
      return init;
    };

    this.numDummies = function () {
      return numDummies;
    };

  }

  return dummy;
});
