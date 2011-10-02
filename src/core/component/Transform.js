/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    return function( engine ) {
        
        var math = engine.math;

        var Transform = function( options ) {

            option = options || {};

            var _position = math.Vector3( math.vector3.zero );        
            Object.defineProperty( this, 'position', {
                get: function() {
                    return _position;
                },
                set: function( value ) {
                    if( !math.vector3.equal( value, _position ) )
                        _position = value;
                }
            });

            var _rotation = math.Vector3( math.vector3.zero );
            Object.defineProperty( this, 'rotation', {
                get: function() {
                    return _rotation;
                },
                set: function( value ) {
                    if( !math.vector3.equal( value, _rotation ) )
                        _rotation = value;
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
