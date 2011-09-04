/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

  var Entity = function( engine, options ) {

      this.init = this.init_Entity = function() {
          this.id = engine.nextGUID;
      };      

  }

  return Entity;

});
