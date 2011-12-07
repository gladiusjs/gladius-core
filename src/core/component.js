/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    var Delegate = require( './delegate' );

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
/*
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

        // Delegates

        var _ownerChanged = new Delegate();
        Object.defineProperty( this, 'ownerChanged', {
            get: function() {
                return _ownerChanged;
            }
        });
        var onOwnerChanged = function( options ) {
            if( _ownerChanged ) {
                _ownerChanged( options );
            }
        };
*/
    };

    return Component;

});
