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

        var _entitiesById = {};
        var _entitiesByName = {};

        this.Entity = function( options ) {
            options = options || {};
            options.manager = that;

            var entity = new engine.core.Entity( options );

            // Index by id            
            _entitiesById[entity.id] = entity;

            // Index by name
            if( entity.name ) {
                if( !_entitiesByName.hasOwnProperty( entity.name ) )
                    _entitiesByName[entity.name] = [];
                _entitiesByName[entity.name].push( entity );
            }

            ++ _size;

            return entity;
        };

        // Remove an entity by id from the id index. Return the removed entity, or null.
        var _removeById = function( id ) {
            if( _entitiesById.hasOwnProperty( id ) ) {
                var entity = _entitiesById[id];
                delete _entitiesById[id];
                -- _size;
                return entity;
            } else {
                return null;
            }
        };

        // Remove the first entity with the given name from the name index. Return the removed entity, or null.
        var _removeByName = function( name ) {
            if( _entitiesByName.hasOwnProperty( name ) ) {
                var entity = _entitiesByName[name][0];
                _entitiesByName[name].remove( 0 );
                if( 0 === _entitiesByName[name].length )
                    delete _entitiesByName[name];
                return entity;
            }
        };

        // Remove the given entity
        this.remove = function( entity ) {
            if( entity ) {
                _removeById( entity.id );

                if( entity.name && _entitiesByName.hasOwnProperty( entity.name ) ) {
                    var i = _entitiesByName[entity.name].indexOf( entity );
                    if( -1 != i ) {
                        _entitiesByName[entity.name].remove( i );
                        if( 0 === _entitiesByName[entity.name].length )
                            delete _entitiesByName[entity.name];
                    }
                }
            }
        };

        // Remove the first entity with the given name
        this.removeNamed = function( name ) {
            if( name ) {
                var entity = _removeByName( name );

                if( entity )
                    _removeById( entity.id );
            }
        };

        // Remove all entities with the given name
        this.removeAllNamed = function( name ) {
            if( name && _entitiesByName.hasOwnProperty( name ) ) {
                while( _entitiesByName[name].length > 0 ) {
                    var entity = _removeByName( name );
                    _removeById( entity.id );
                }
            }
        };

        // Find the first entity with the given name and return it, or null.
        this.find = function( name ) {
            if( name && _entitiesByName.hasOwnProperty( name ) ) {
                return _entitiesByNames[name][0];
            }

            return null;
        };

        // Find the first entity that has a component with the given type and return it, or null.
        this.findWith = function( type ) {
            if( type ) {
                for( var entity in _entitiesById ) {
                    if( entity.contains( type ) )
                        return entity;
                }
            }

            return null;
        };

        // Find all entities with the given component and return a (possibly empty) list of entities.
        this.findAllWith = function( type ) {
            if( type ) {
                var result = [];
                for( var entity in _entitiesById ) {
                    if( entity.contains( type ) )
                        result.push( entity );
                }
                return result;
            }

            return [];
        };

        // Find the first entity with the given name that has a component of the given type and return the
        // component, or null.
        this.findComponent = function( name, type ) {
            if( name && type ) {
                if( _entitiesByName.hasOwnProperty( name ) ) {
                    for( var i = 0; i < _entitiesByName[name]; ++ i ) {
                        if( _entitiesByName[name][i].contains( type ) )
                            return _entitiesByName[name][i];
                    }
                }
            }

            return null;
        };

        // Events

        var onEntityAdded = function() {
        };

        var onEntityRemoved = function() {
        };

    };

    return Scene;

});
