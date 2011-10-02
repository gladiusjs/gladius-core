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
                    return math.Vector3( _position );
                },
                set: function( value ) {
                    if( !math.vector3.equal( value, _position ) ) {                       
                        _position = value;
                        _valid = false;
                    }
                }
            });

            var _rotation = math.Vector3( math.vector3.zero );
            Object.defineProperty( this, 'rotation', {
                get: function() {
                    return math.Vector3( _rotation );
                },
                set: function( value ) {
                    if( !math.vector3.equal( value, _rotation ) ) {
                        _rotation = value;
                        _valid = false;
                    }
                }
            });

            var _scale = new math.Vector3( math.vector3.one );
            Object.defineProperty( this, 'scale', {
                get: function() {
                    return math.Vector3( _scale );
                },
                set: function( value ) {
                    if( !math.vector3.equal( value, _scale ) ) {
                        _scale = value;
                        _valid = false;
                    }
                }
            });
            
            // True if the cached transform is valid, false otherwise.
            var _valid = true;
            
            var _absolute = math.transform.fixed( _position, _rotation, _scale );
            var _relative = math.matrix4.inverse( _absolute );
            
            Object.defineProperty( this, 'absolute', {
                get: function() {
                    if( !_valid ) {
                        _absolute = math.transform.fixed( _position, _rotation, _scale );
                        _relative = math.matrix4.inverse( _absolute );
                        _valid = true;
                    }

                    return _absolute;
                }
            });
            
            Object.defineProperty( this, 'relative', {
                get: function() {
                    if( !_valid ) {
                        _absolute = math.transform.fixed( _position, _rotation, _scale );
                        _relative = math.matrix4.inverse( _absolute );
                        _valid = true;
                    }

                    return _relative;                    
                }
            });

        };
        Transform.prototype = new engine.Component({
            type: 'Transform'
        });
        Transform.prototype.constructor = Transform;
        
        return Transform;
        
    };

});
