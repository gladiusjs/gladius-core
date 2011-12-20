/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

  return function( options ) {

      options = options || {};
      var _that = this;

      var _targetElement = options.element,
          _context = CubicVR.init({
              context: window.guid(),
              canvas: _targetElement
          });

      Object.defineProperty( this, "element", {
          enumerable: true,
          configurable: false,
          get: function() {
              return _targetElement;
          }
      });

      Object.defineProperty( this, "context", {
          enumerable: true,
          configurable: false,
          get: function() {
              return _context;
          }
      });

    };

});

