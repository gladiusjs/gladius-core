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

        var _size = 0;
        Object.defineProperty( this, 'size', {
            get: function() {
                return _size;
            }
        });

        var _entities = {};

        this.Entity = function( options ) {
            options = options || {};
            options.manager = that;

            var entity = new engine.Entity( options );
            
            if( !_entities.hasOwnProperty( entity.name ) )
                _entities[entity.name] = [];
            _entities[entity.name].push( entity );
            ++ _size;

            return entity;
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
