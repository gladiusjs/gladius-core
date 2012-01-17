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
                            parent.childRemoved( this );
                        }

                        var previous = _parent;
                        _parent = value;
                        onParentChanged({
                            previous: previous,
                            current: value
                        });

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
                    _manager = value;
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
                onComponentAdded( component );
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
                    onComponentRemoved( previousComponent );
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

            var _handlers = {};	// Keeps track of events that this entity will handle

            // Returns true if this entity handles events of type, false otherwise
            this.handles = function( type ) {
                return _handlers.hasOwnProperty( type );
            };

            // Register an event handler for an event type
            this.registerHandler = function( type, handler ) {
                if( !_handlers.hasOwnProperty( type ) ) {
                    _handlers[type] = new Delegate();
                }
                _handlers[type].subscribe( handler );
            };

            // Unregister an event handler for an event type
            this.unregisterHandler = function( type, handler ) {
                if( _handlers.hasOwnProperty( type ) ) {
                    _handlers[type].unsubscribe( handler );
                    if( _handlers.size === 0 ) {
                        delete _handlers[type];
                    }
                }
            };

            // Delegates

            var _parentChanged = new Delegate();
            Object.defineProperty( this, 'parentChanged', {
                get: function() {
                    return _parentChanged;
                }
            });
            var onParentChanged = function( options ) {
                if( _parentChanged ) {
                    _parentChanged( options );
                }
            };

            var _managerChanged = new Delegate();
            Object.defineProperty( this, 'managerChanged', {
                get: function() {
                    return _managerChanged;
                }
            });
            var onManagerChanged = function( options ) {
                if( _managerChanged ) {
                    _managerChanged( options );
                }
            };

            var _childAdded = new Delegate();
            Object.defineProperty( this, 'childAdded', {
                get: function() {
                    return _childAdded;
                }
            });
            var onChildAdded = function( options ) {
                if( _childAdded ) {
                    _childAdded( options );
                }
            };

            var _childRemoved = new Delegate();
            Object.defineProperty( this, 'childRemoved', {
                get: function() {
                    return _childRemoved;
                }
            });
            var onChildRemoved = function( options ) {
                if( _childRemoved ) {
                    _childRemoved( options );
                }
            };

            var _componentAdded = new Delegate();
            Object.defineProperty( this, 'componentAdded', {
                get: function() {
                    return _componentAdded;
                }
            });
            var onComponentAdded = function( component ) {
                if( _componentAdded ) {
                    _componentAdded( component );
                }
            };

            var _componentRemoved = new Delegate();
            Object.defineProperty( this, 'componentRemoved', {
                get: function() {
                    return _componentRemoved;
                }
            });
            var onComponentRemoved = function( component ) {
                if( _componentRemoved ) {
                    _componentRemoved( component );
                }
            };

            // Delegate handlers

            var handleChildAdded = function( child ) {
                _children[child.id] = child;
            };
            _childAdded.subscribe( handleChildAdded );

            var handleChildRemoved = function( child ) {
                delete _children[child.id];
            };
            _childRemoved.subscribe( handleChildRemoved );

            var _handleEvent = function( event ) {
                if( _handlers.hasOwnProperty( event.type ) ) {
                    console.log( 'handling ' + event.type );
                    _handlers[event.type]( event );
                }
            };
            Object.defineProperty( this, 'handleEvent', {
                get: function() {
                    return _handleEvent;
                }
            });

            if( options.components ) {
                options.components.forEach( function( component ) {
                    that.add( component );
                });
            }

        };

        return Entity;

    };

});
