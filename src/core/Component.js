/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    /* Component
     *
     * A component provides contains data and logic for a specific game function.
     */

    var Component = function( options ) {

        option = options || {};

        var _type = options.type || undefined;
        Object.defineProperty( this, 'type', {
            get: function() {
                return _type;
            }
        });

        var _depends = options.depends || {};
        Object.defineProperty( this, 'depends', {
            get: function() {
                return _depends;
            }
        });

        var _owner = null;
        Object.defineProperty( this, 'owner', {
            get: function() {
                return _owner;
            },
            set: function( value ) {
                if( value != _owner ) {
                    _owner = value;
                    onOwnerChanged( value );
                }
            }
        });

        // Events

        var onOwnerChanged = function() {
        };

    };

    return Component;

});
