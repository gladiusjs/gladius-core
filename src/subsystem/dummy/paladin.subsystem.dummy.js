(function (window, document, Paladin, undefined) {

  var numDummies = 0;

  Paladin.subsystem.register( "dummy", function ( options ) {
  
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

  });

})(window, window.document, Paladin);
