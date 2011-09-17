/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    var Component = require( 'core/Component' );

    var Transform = function( options ) {

        option = options || {};

        var _position = new math.Vector3( math.vector3.zero );
        Object.defineProperty( this, 'position', {
            get: function() {
                return _position;
            },
            set: function( value ) {

            }
        });

    };
    Transform.prototype = new Component({
        type: 'Transform',
        depends: []
    });
    Transform.prototype.constructor = Transform;

    return Transform;

});
