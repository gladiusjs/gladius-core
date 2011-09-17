/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

var _Math = function( options ) {

    var that = this;

    var assert = function( condition, message ) {
        if( !condition )
            throw message;
    };

    var FLOAT_ARRAY_ENUM = {
            Float32: Float32Array,
            Float64: Float64Array
    };
    const FLOAT_ARRAY_TYPE = FLOAT_ARRAY_ENUM.Float32;

    Object.defineProperty( this, 'ARRAY_TYPE', {
        get: function() {
            return FLOAT_ARRAY_TYPE;
        }
    });

    var Vector = function( dim, args ) {
        var elements = null;
        if( 1 === args.length ) {
            elements = args[0];
        }
        else {
            elements = args;
        }

        assert( elements.length >= dim,
                'Invalid number of elements: ' + args.length );

        var vector = new FLOAT_ARRAY_TYPE( dim );
        for( var i = 0; i < dim; ++ i )
            vector[i] = elements[i];

        return vector;
    };

    var vector = {

            iadd: function( v1, v2 ) {
                assert( v1.length === v2.length,
                'v1 and v2 must have the same number of components' );

                for( var i = 0; i < v1.length; ++ i )
                    v1[i] += v2[i]

                return v1;
            },

            equal: function( v1, v2 ) {
                if( v1.length != v2.length )
                    return false;
                var dim = v1.length;
                for( var i = 0; i < dim; ++ i ) {
                    if( v1[i] != v2[i] )
                        return false
                }

                return true;
            },

            imultiply: function( v, s ) {
                for( var i = 0; i < v.length; ++ i )
                    v[i] *= s;

                return v
            },

            isubtract: function( v1, v2 ) {
                assert( v1.length === v2.length,
                'v1 and v2 must have the same number of components' );

                for( var i = 0; i < v1.length; ++ i )
                    v1[i] -= v2[i]

                return v1;
            }

    };

    this.Vector2 = function() {
        if( 0 === arguments.length )
            return Vector( 2, [0, 0] );
        else
            return Vector( 2, arguments );
    };
    this.vector2 = {

            add: function( v1, v2 ) {
                assert( v1.length === v2.length,
                'v1 and v2 must have the same number of components' );

                return new that.Vector2(
                        v1[0] + v2[0],
                        v1[1] + v2[1],
                        v1[2] + v2[2]
                );
            },

            iadd: vector.iadd,

            angle: function( v1, v2 ) {
            },

            cross: function( v1, v2 ) {
            },

            dot: function( v1, v2 ) {
            },

            equal: vector.equal,

            length: function( v ) {
                return Math.sqrt( v[0] * v[0] + v[1] * v[1] );
            },

            multiply: function( v, s ) {
                var w = new that.Vector2( v[0], v[1] );

                for( var i = 0; i < w.length; ++ i )
                    w[i] *= s;

                return w;
            },

            imultiply: vector.imultiply,

            normal: function( v ) {
            },

            normalize: function( v ) {
            },

            inormalize: function( v ) {
            },

            subtract: function( v1, v2 ) {
                assert( v1.length === v2.length,
                'v1 and v2 must have the same number of components' );

                return new that.Vector2(
                        v1[0] - v2[0],
                        v1[1] - v2[1],
                        v1[2] - v2[2]
                );
            },

            isubtract: vector.isubtract

    };

    this.Vector3 = function() {
        if( 0 === arguments.length )
            return Vector( 3, [0, 0, 0] );
        else
            return Vector( 3, arguments );
    };
    this.vector3 = {

            add: function( v1, v2 ) {
            },

            iadd: vector.iadd,

            angle: function( v1, v2 ) {
            },

            cross: function( v1, v2 ) {
            },

            dot: function( v1, v2 ) {
            },

            equal: vector.equal,

            length: function( v ) {
            },

            multiply: function( v, s ) {
            },

            imultiply: vector.imultiply,

            normalize: function( v ) {
            },

            inormalize: function( v ) {
            },

            subtract: function( v1, v2 ) {
            },

            isubtract: vector.isubtract

    };

    this.Vector4 = function() {
        if( 0 === arguments.length )
            return Vector( 4, [0, 0, 0, 0] );
        else
            return Vector( 4, arguments );
    };
    this.vector4 = {

            add: function( v1, v2 ) {
            },

            iadd: vector.iadd,

            angle: function( v1, v2 ) {
            },

            dot: function( v1, v2 ) {
            },

            equal: vector.equal,

            length: function( v ) {
            },

            multiply: function( v, s ) {
            },

            imultiply: vector.imultiply,

            normalize: function( v ) {
            },

            inormalize: function( v ) {
            },

            subtract: function( v1, v2 ) {
            },

            isubtract: vector.isubtract

    };

    this.Quaternion = function() {
        if( 0 === arguments.length )
            return Vector( 4, [0, 0, 0, 1] );
        else
            return Vector( 4, arguments );
    };
    this.quaternion = {

            length: this.vector4.length,

            normalize: this.vector4.normalize,

            inormalize: this.vector4.inormalize,

            multiply: function( q1, q2 ) {
            }

    };

    const _x = new this.Vector4( 1.0, 0.0, 0.0, 0.0 );
    const _y = new this.Vector4( 0.0, 1.0, 0.0, 0.0 );
    const _z = new this.Vector4( 0.0, 0.0, 1.0, 0.0 );
    const _w = new this.Vector4( 0.0, 0.0, 0.0, 1.0 );
    const _0 = new this.Vector4( 0.0, 0.0, 0.0, 0.0 );
    const _1 = new this.Vector4( 1.0, 1.0, 1.0, 1.0 );

    const _vector2_x = _x.subarray( 0, 2 );
    Object.defineProperty( this.vector2, 'x', {
        get: function() {
            return _vector2_x;
        }
    });
    Object.defineProperty( this.vector2, 'u', {
        get: function() {
            return _vector2_x;
        }
    });

    const _vector2_y = _y.subarray( 0, 2 );
    Object.defineProperty( this.vector2, 'y', {
        get: function() {
            return _vector2_y;
        }
    });
    Object.defineProperty( this.vector2, 'v', {
        get: function() {
            return _vector2_y;
        }
    });

    const _vector2_0 = _0.subarray( 0, 2 );
    Object.defineProperty( this.vector2, 'zero', {
        get: function() {
            return _vector2_0;
        }
    });

    const _vector2_1 = _1.subarray( 0, 2 );
    Object.defineProperty( this.vector2, 'one', {
        get: function() {
            return _vector2_1;
        }
    });
    
    const _quaternion_0 = new this.Quaternion( 0, 0, 0, 1 );
    Object.defineProperty( this.quaternion, 'zero', {
        get: function() {
            return _quaternion_0;
        }
    });

    this.Matrix2 = function() {
    };
    this.matrix2 = {
    };

    this.Matrix3 = function() {
    };
    this.matrix3 = {
    };

    this.Matrix4 = function() {
    };
    this.matrix4 = {
    };

}  

window.math = new _Math();
