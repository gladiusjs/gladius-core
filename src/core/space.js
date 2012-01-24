/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    var lang = require( 'lang' );
    var Delegate = require( 'common/delegate' );

    /* Scene
     *
     * A Scene is a collection of Entities (and their Components). It also provides
     * a mechanism to make new Entities
     */

    return function( engine ) {

        var Space = function( options ) {

            var that = this;
            options = options || {};

            var _engine = engine;
            Object.defineProperty( this, 'engine', {
                get: function() {
                    return _engine;
                }
            });
            
            var _id = lang.guid();
            Object.defineProperty( this, 'id', {
                get: function() {
                    return _id;
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

                that.add( entity );

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
            
            this.add = function( entity ) {
                if( entity ) {                    
                    // Index by id            
                    _entitiesById[entity.id] = entity;

                    // Index by name
                    if( entity.name ) {
                        if( !_entitiesByName.hasOwnProperty( entity.name ) )
                            _entitiesByName[entity.name] = [];
                        _entitiesByName[entity.name].push( entity );
                    }

                    ++ _size;
                    
                    var children = entity.children;
                    for( var i = 0, l = children.length; i < l; ++ i ) {
                        that.add( children[i] );
                    }
                }
            };

            // Remove the given entity
            this.remove = function( entity ) {
                if( entity ) {
                    _removeById( entity.id );
                    var i;

                    if( entity.name && _entitiesByName.hasOwnProperty( entity.name ) ) {
                        i = _entitiesByName[entity.name].indexOf( entity );
                        if( -1 != i ) {
                            _entitiesByName[entity.name].remove( i );
                            if( 0 === _entitiesByName[entity.name].length )
                                delete _entitiesByName[entity.name];
                        }
                    }
                    
                    var children = entity.children;
                    for( i = 0, l = children.length; i < l; ++ i ) {
                        that.remove( children[i] );
                    }
                }
            };

            // Remove the first entity with the given name
            this.removeNamed = function( name ) {
                if( name ) {
                    var entity = _entitiesByName[name];

                    if( entity )
                        that.remove( entity );
                }
            };

            // Remove all entities with the given name
            this.removeAllNamed = function( name ) {
                if( name && _entitiesByName.hasOwnProperty( name ) ) {
                    while( _entitiesByName[name].length > 0 ) {
                        var entity = _entitiesByNames[name];
                        that.remove( entity );
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
            
            // Find all entities with the given name and return a (possibly empty) list of entities.
            this.findAll = function( name ) {
                if( name && _entitiesByName.hasOwnProperty( name ) ) {
                    return _entitiesByName[name].slice( 0 );
                }
                
                return [];
            };

            // Find the first entity that has a component with the given type and return it, or null.
            this.findWith = function( type ) {
                if( type ) {
                    var entity;
                    for( var entityId in _entitiesById ) {
                        entity = _entitiesById[ entityId ];
                        if( entity.contains( type ) )
                            return entity;
                    }
                }

                return null;
            };

            // Find all entities with the given component and return a (possibly empty) list of entities.
            this.findAllWith = function( type ) {
                if( type ) {
                    var result = [],
                        entity;
                    for( var entityId in _entitiesById ) {
                        entity = _entitiesById[ entityId ];
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

            // Delegates
            var _entityAdded = new Delegate();
            Object.defineProperty( this, 'entityAdded', {
                get: function() {
                    return _entityAdded;
                }
            });
            var onEntityAdded = function( options ) {
                if( _entityAdded ) {
                    _entityAdded( options );
                }
            };

            var _entityRemoved = new Delegate();
            Object.defineProperty( this, 'entityRemoved', {
                get: function() {
                    return _entityRemoved;
                }
            });
            var onEntityRemoved = function( options ) {
                if( _entityRemoved ) {
                    _entityRemoved( options );
                }
            };

        };

        return Space;

    };

});
