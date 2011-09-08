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

        // Members

        var _guid = engine.nextGuid                 // Globally-unique ID
        Object.defineProperty( this, 'guid', {
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

        var _components = {};       // Dictionary of components, indexed by component type

        // 
        var updateComponentDependencies = function() {
        };

        // Methods

        // Add a component.
        this.add = function( options ) {
        };

        // Remove a component.
        this.remove = function( options ) {
        };

        // Return the number of components present.
        this.size = function() {
        };

        // Events

        var onParentChanged = function() {
        };

        var onComponentAdded = function() {
        };

        var onComponentRemoved = function() {
        };

    }

    return Entity;

});
