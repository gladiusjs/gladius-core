/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

  var Entity = function( engine, options ) {     

      this.init = function() {
          this.id = engine.nextGUID;
      };

      this.init_Entity = this.init;
      if( options && (options.init ? options.init : true) )
          this.init(); 

  }

  return Entity;

});
