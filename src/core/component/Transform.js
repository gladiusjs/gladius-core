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
                if( !math.vector3.equal( value, _position ) )
                    _position = value;
            }
        });
        
        var _orientation = new math.Quaternion( math.quaternion.zero );
        Object.defineProperty( this, 'orientation', {
            get: function() {
                return _orientation;
            },
            set: function( value ) {
                if( !math.quaternion.equal( value, _orientation ) )
                    _orientation = value;
            }
        });
        
        var _scale = new math.Vector3( math.vector3.one );
        Object.defineProperty( this, 'scale', {
            get: function() {
                return _scale;
            },
            set: function( value ) {
                if( !math.vector3.equal( value, _scale ) )
                    _scale = value;
            }
        });

    };
    Transform.prototype = new Component({
        type: 'Transform',
    });
    Transform.prototype.constructor = Transform;

    return Transform;

});
