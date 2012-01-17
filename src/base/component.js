/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    var lang = require( 'lang' );
    var Delegate = require( 'common/delegate' );

    var IComponent = function( options ) {

        options = options || {};

        var _type = options.type || undefined;
        Object.defineProperty( this, 'type', {
            get: function() {
                return _type;
            }
        });

        var _depends = options.depends || [];
        Object.defineProperty( this, 'depends', {
            get: function() {
                return _depends;
            }
        });

    };

    var Component = function( options, c ) {

        option = options || {};

        var r = function( options ) {

            options = options || {};

            var _owner = null;
            Object.defineProperty( this, 'owner', {
                get: function() {
                    return _owner;
                },
                set: function( value ) {
                    if( value != _owner ) {
                        var previous = _owner;
                        _owner = value;
                        onOwnerChanged({
                            current: value, 
                            previous: previous
                        });
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

            c.call( this, options );
            
        };
        r.prototype = new IComponent( options );
        r.prototype.constructor = r;

        return r;

    };

    return Component;

});
