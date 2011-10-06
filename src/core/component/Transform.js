/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    return function( engine ) {
        
        var math = engine.math;
        var Component = require( '../Component' );

        var Transform = function( options ) {

            option = options || {};
            var that = this;

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
            
            var _absolute = null;
            var _relative = null;
            
            Object.defineProperty( this, 'absolute', {
                get: function() {
                    if( !_absolute ) {
                        math.transform.fixed(   // Compute fixed transform
                                math.vector3.equal( _position, math.vector3.zero ) ? null : _position, 
                                math.vector3.equal( _rotation, math.vector3.zero ) ? null : _rotation, 
                                math.vector3.equal( _scale, math.vector3.one ) ? null : _scale, 
                                _absolute
                        );
                        if( that.owner && that.owner.contains( that.type ) )
                            math.matrix4.multiply( that.owner.find( that.type ).absolute, _absolute, _absolute ); // Apply parent transform
                    }

                    return _absolute;
                }
            });
            
            Object.defineProperty( this, 'relative', {
                get: function() {
                    if( !_relative ) {
                        if( !_absolute ) {  // Relative transform is computed from the absolute transform, so check it now
                            math.transform.fixed(
                                    math.vector3.equal( _position, math.vector3.zero ) ? null : _position, 
                                    math.vector3.equal( _rotation, math.vector3.zero ) ? null : _rotation, 
                                    math.vector3.equal( _scale, math.vector3.one ) ? null : _scale, 
                                    _absolute
                            );
                        }
                        if( that.owner && that.owner.contains( that.type ) )
                            math.matrix4.multiply( that.owner.find( that.type ).absolute, _absolute, _absolute ); // Apply parent transform
                        math.matrix4.inverse( _absolute, _relative );
                    }

                    return _relative;                    
                }
            });
            
            // Events          

        };
        Transform.prototype = new Component({
            type: 'Transform'
        });
        Transform.prototype.constructor = Transform;
        
        return Transform;
        
    };

});
