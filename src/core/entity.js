/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    var lang = require( 'lang' );
    var Delegate = require( 'common/delegate' );

    /* Entity
     *
     * An entity is a collection of entity components under a single globally unique identifier.
     */

    return function( engine ) {

        var Entity = function( options ) {               

            options = options || {};
            var that = this;

            // Members

            var _guid = lang.guid();                 // Globally-unique ID
            Object.defineProperty( this, 'id', {
                get: function() {
                    return _guid;
                }
            });

            var _name = options.name || null;           // Name string
            Object.defineProperty( this, 'name', {
                get: function() {
                    return _name;
                }
            });
            
            var _active = options.active || true;
            Object.defineProperty( this, 'active', {
                get: function() {
                    return _active;
                },
                set: function( value ) {
                    _active = value;
                }
            });

            var _parent = options.parent || null;       // Parent entity, or null if no parent
            Object.defineProperty( this, 'parent', {
                get: function() {
                    return _parent;
                },
                set: function( value ) {
                    if( value != this && value != _parent ) {
                        if( _parent ) {
                            _parent.childRemoved( this );
                        }

                        var previous = _parent;
                        _parent = value;
                        _handleEvent( new engine.core.Event({
                            type: 'EntityParentChanged',
                            queue: false,
                            data: {
                                previous: previous,
                                current: value
                            }
                        }));

                        if( _parent ) {
                            _parent.childAdded( this );
                        }
                    }
                }
            });

            var _children = {};
            Object.defineProperty( this, 'children', {
                get: function() {
                    return lang.clone( _children );
                }
            });

            var _manager = options.manager || null;     // Component manager
            Object.defineProperty( this, 'manager', {
                get: function() {
                    return _manager;
                },
                set: function( value ) {
                    if( value !== this && value !== _manager ) {
                        var previous = _manager;
                        _manager = value;
                        _handleEvent( new engine.core.Event({
                            type: 'EntityManagerChanged',
                            queue: false,
                            data: {
                                previous: previous,
                                current: value
                            }
                        }));
                    }
                }
            });

            var _size = 0;
            Object.defineProperty( this, 'size', {
                get: function() {
                    return _size;
                }
            });

            var _components = {};       // Dictionary of components, indexed by component type

            // Methods

            // Add a component and return the previous component of the same type, or null.
            this.add = function( component ) {            
                var previousComponent = that.remove( component.type );
                component.owner = that;
                _components[component.type] = component;
                ++ _size;                
                _handleEvent( new engine.core.Event({
                    type: 'EntityComponentAdded',
                    queue: false,
                    data: {
                        component: component
                    }
                }));
                return previousComponent || null;
            };

            // Remove a component and return it, or null.
            this.remove = function( type ) {
                var previousComponent;
                if( _components.hasOwnProperty( type ) ) {
                    previousComponent = _components[type];
                    delete _components[type];
                    previousComponent.owner = null;
                    -- _size;
                    _handleEvent( new engine.core.Event({
                        type: 'EntityComponentRemoved',
                        queue: false,
                        data: {
                            component: previousComponent
                        }
                    }));
                }
                return previousComponent || null;
            };

            // Find the first occurrence of a component with a given type and return it, or null.
            this.find = function( type ) {
                if( !_components.hasOwnProperty( type ) )
                    return null;

                return _components[type];
            };

            // Return true if this entity has a component with a given type, or false.
            this.contains = function( type ) {
                return _components.hasOwnProperty( type );
            };
            
            this.childAdded = function( child ) {
                _children[child.id] = child;
                _handleEvent( new engine.core.Event({
                    type: 'EntityChildAdded',
                    queue: false,
                    data: {
                        entity: child
                    }
                }));
                
            };
            
            this.childRemoved = function( child ) {
                delete _children[child.id];
                _handleEvent( new engine.core.Event({
                    type: 'EntityChildRemoved',
                    queue: false,
                    data: {
                        entity: child
                    }
                }));
            };

            // Generic event handler; Pass event to each component;
            var _handleEvent = function( event ) {
                var componentTypes = Object.keys( _components );
                for( var i = 0, l = componentTypes.length; i < l; ++ i ) {
                    var component = _components[componentTypes[i]];
                    component.handleEvent.call( component, event );
                }
            };
            Object.defineProperty( this, 'handleEvent', {
                get: function() {
                    return _handleEvent;
                }
            });
            
            // Add each component
            if( options.components ) {
                options.components.forEach( function( component ) {
                    /*
                    // Verify that all dependencies for new component are present
                    component.depends.forEach( function( depend ) {
                        if( !this.contains( depend ) ) {
                            throw 'required component \'' + depend + '\' missing';
                        }
                    });
                    */
                    that.add( component );
                });
            }

        };

        return Entity;

    };

});
