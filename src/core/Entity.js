/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    /* Entity
     *
     * An entity is a collection of entity components under a single globally unique identifier.
     */

    var Entity = function( engine, options ) {     

        options = options || {};
        var that = this;

        // Members

        var _guid = engine.nextGUID;                 // Globally-unique ID
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

        var _parent = options.parent || null;       // Parent entity, or null if no parent
        Object.defineProperty( this, 'parent', {
            get: function() {
                return _parent;
            },
            set: function( value ) {
                if( value != this && value != _parent ) {
                    _parent = value;
                    // TODO: raise an event containing the new parent.
                }
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
            }
            return previousComponent || null;
        };

        // Find the first occurence of a component with a given type and return it, or null.
        this.find = function( type ) {
            if( !_components.hasOwnProperty( type ) )
                return null;

            return _components[type];
        };

        // Return true if this entity has a component with a given type, or false.
        this.contains = function( type ) {
            return _components.hasOwnProperty( type );
        };

        // Events

        var onParentChanged = function() {
        };

        var onComponentAdded = function() {
        };

        var onComponentRemoved = function() {
        };

    };

    return Entity;

});
