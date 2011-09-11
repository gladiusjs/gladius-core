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
    
        var that = this;
        options = options || {};

        var _engine = engine;
        Object.defineProperty( this, 'engine', {
            get: function() {
                return _engine;
            }         
        });

        var _entities = {};

        this.Entity = function( options ) {
            options = options || {};
            options.manager = that;

            return new engine.Entity( options );
        };

        this.remove = function( options ) {
        };

        this.find = function( options ) {
        };

        this.findWith = function( options ) {
        };

        this.findAllWith = function( options ) {
        };

    }

    return Scene;

});
