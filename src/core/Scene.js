/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    /* Scene
     *
     * A Scene is a collection of Entities (and their Components). It also provides
     * a mechanism to make new Entities
     */

    var Scene = function( engine, options ) {     
    
        options = options || {};   

        var _engine = engine;
        Object.defineProperty( this, 'engine', {
            get: function() {
                return _engine;
            }         
        });

        var _entityList = [];

        this.Entity = function() {  // Make a new entity and associate it with this Scene.
        };

    }

    return Scene;

});
