/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    return function( engine ) {

        var Transform = function( options ) {

            option = options || {};

            var _position = new math.Vector3( math.vector3.zero );  // x, y z        
            Object.defineProperty( this, 'position', {
                get: function() {
                    return _position;
                },
                set: function( value ) {
                    if( !math.vector3.equal( value, _position ) )
                        _position = value;
                }
            });

            var _rotation = new math.Quaternion( math.quaternion.identity );    // x, y, z, w
            Object.defineProperty( this, 'rotation', {
                get: function() {
                    return _rotation;
                },
                set: function( value ) {
                    if( 4 === value.length ) {  // quaternion
                        if( !math.quaternion.equal( value, _rotation ) )
                            _rotation = value;
                    } else if( 3 === value.length ) {   // euler angles
                        var c1 = Math.cos((Math.PI / 180.0) * value[0] / 2.0);
                        var s1 = Math.sin((Math.PI / 180.0) * value[0] / 2.0);
                        var c2 = Math.cos((Math.PI / 180.0) * value[1] / 2.0);
                        var s2 = Math.sin((Math.PI / 180.0) * value[1] / 2.0);
                        var c3 = Math.cos((Math.PI / 180.0) * value[2] / 2.0);
                        var s3 = Math.sin((Math.PI / 180.0) * value[2] / 2.0);
                        var c1c2 = c1 * c2;
                        var s1s2 = s1 * s2;

                        _rotation[0] = c1c2 * s3 + s1s2 * c3;
                        _rotation[1] = s1 * c2 * c3 + c1 * s2 * s3;
                        _rotation[2] = c1 * s2 * c3 - s1 * c2 * s3;
                        _rotation[3] = c1c2 * c3 - s1s2 * s3;                    
                    }
                }
            });

            var _scale = new math.Vector3( math.vector3.one );  // x, y, z
            Object.defineProperty( this, 'scale', {
                get: function() {
                    return _scale;
                },
                set: function( value ) {
                    if( !math.vector3.equal( value, _scale ) )
                        _scale = value;
                }
            });

            var _local = null;
            Object.defineProperty( this, 'local', {
                get: function() {
                }
            });

            var _world = null;
            Object.defineProperty( this, 'world', {
                get: function() {

                }
            });
        };
        Transform.prototype = new engine.Component({
            type: 'Transform'
        });
        Transform.prototype.constructor = Transform;
        
    };

});
