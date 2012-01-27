/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    return function( engine ) {

        var math = engine.math;
        var Component = require( 'base/component' );
        var Delegate = require( 'common/delegate' );

        return Component({
            type: 'Transform'
        },
        function( options ) {

            options = options || {};
            var that = this;
            var _position = options.position || math.vector3.zero;
            var _rotation = options.rotation || math.vector3.zero;
            var _scale = options.scale || math.vector3.one;
            var _absolute = null;
            var _relative = null;

            var _cache = math.matrix4.identity;
            var _cached = false;    // True if the cached version of our fixed transform is valid, false otherwise

            var matrix = function() {
                if( _cached ) {
                    return _cache;
                } else {
                    _cache = math.transform.fixed( _position, _rotation, _scale );   // TD: this should compute the result into the buffer instead of returning a new matrix
                    _cached = true;
                    return _cache;
                }
            };

            Object.defineProperty( this, 'position', {
                get: function() {
                    return math.Vector3( _position );
                },
                set: function( value ) {
                    if( !math.vector3.equal( value, _position ) ) {
                        _position = value;  // TD: math.vector3.copy( _position, value )
                        _cached = false;
                    }
                }
            });

            Object.defineProperty( this, 'rotation', {
                get: function() {
                    return math.Vector3( _rotation );
                },
                set: function( value ) {
                    if( !math.vector3.equal( value, _rotation ) ) {
                        _rotation = value;  // TD: math.vector3.copy( _rotation, value )
                        _cached = false;
                    }
                }
            });

            Object.defineProperty( this, 'scale', {
                get: function() {
                    return math.Vector3( _scale );
                },
                set: function( value ) {
                    if( !math.vector3.equal( value, _scale ) ) {
                        _scale = value;     // TD: math.vector3.copy( _scale, value )
                        _cached = false;
                    }
                }
            });

            Object.defineProperty( this, 'absolute', {
                get: function() {
                    if( this.owner.parent && this.owner.parent.contains( this.type ) ) {
                        var parentTransform = this.owner.parent.find( this.type );                            
                        _absolute = math.matrix4.multiply( [matrix(), parentTransform.absolute] );
                    } else {
                        _absolute = matrix();
                    }
                    return math.Matrix4( _absolute );   // TD: math.matrix4.copy( _absolute )
                }
            });

            Object.defineProperty( this, 'relative', {
                get: function() {
                }
            });

        });

    };

});
