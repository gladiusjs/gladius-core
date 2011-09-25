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
            
            clear: function( v ) {
                for( var i = 0; i < v.length; ++ i )
                    v[i] = 0;
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
                var r = new that.Vector2( v );

                for( var i = 0; i < 2; ++ i )
                    r[i] *= s;

                return r;
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
                return Math.sqrt( v[0] * v[0] + v[1] * v[1] + v[2] * v[2] + v[3] * v[3] );
            },

            multiply: function( v, s ) {
            },

            imultiply: vector.imultiply,

            normalize: function( v ) {
                var l = that.vector4.length( v );
                var r = new that.Vector4( v );
                
                for( var i = 0; i < 4; ++ i )
                    r[i] /= length;
                
                return r;
            },

            inormalize: function( v ) {
                var l = that.vector4.length( v );
                
                for( var i = 0; i < 4; ++ i )
                    v[i] /= length;
                
                return v;
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
                var r = new that.Quaternion();
                
                r[0] = q1[3] * q2[0] + q1[0] * q2[3] + q1[1] * q2[2] - q1[2] * q2[1];   // x
                r[1] = q1[3] * q2[1] - q1[0] * q2[2] + q1[1] * q2[3] + q1[2] * q2[0];   // y
                r[2] = q1[3] * q2[2] + q1[0] * q2[1] - q1[1] * q2[0] + q1[2] * q2[3];   // z
                r[3] = q1[3] * q2[3] - q1[0] * q2[0] - q1[1] * q2[1] - q1[2] * q2[2];   // w
                
                return r;
            },
    
            imultiply: function( q1, q2 ) {
                var t1 = new that.Quaternion( q1 );
                
                q1[0] = t1[3] * q2[0] + t1[0] * q2[3] + t1[1] * q2[2] - t1[2] * q2[1];   // x
                q1[1] = t1[3] * q2[1] - t1[0] * q2[2] + t1[1] * q2[3] + t1[2] * q2[0];   // y
                q1[2] = t1[3] * q2[2] + t1[0] * q2[1] - t1[1] * q2[0] + t1[2] * q2[3];   // z
                q1[3] = t1[3] * q2[3] - t1[0] * q2[0] - t1[1] * q2[1] - t1[2] * q2[2];   // w
                
                return q1;
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
    
    const _quaternion_identity = new this.Quaternion( 0, 0, 0, 1 );
    Object.defineProperty( this.quaternion, 'identity', {
        get: function() {
            return _quaternion_identity;
        }
    });
    
    var Matrix = function( dim, args ) {
        var elements = null;
        if( 1 === args.length ) {
            elements = args[0];
        }
        else {
            elements = args;
        }

        assert( elements.length >= dim,
                'Invalid number of elements: ' + args.length );

        var matrix = new FLOAT_ARRAY_TYPE( dim );
        for( var i = 0; i < dim; ++ i )
            vector[i] = elements[i];

        return matrix;
    };
    
    var matrix = {

        clear: function( m ) {
            for( var i = 0; i < m.length; ++ i )
                m[i] = 0;
        },
        
        equal: function( m1, m2 ) {
            if( m1.length != m2.length )
                return false;
            var dim = m1.length;
            for( var i = 0; i < dim; ++ i ) {
                if( m1[i] != m2[i] )
                    return false
            }

            return true;
        }
        
    };

    this.Matrix2 = function() {
        if( 0 === arguments.length )
            return Matrix( 4, [0, 0,
                               0, 0] );
        else
            return Matrix( 4, arguments );
    };
    
    this.matrix2 = {
    };

    this.Matrix3 = function() {
        if( 0 === arguments.length )
            return Matrix( 9, [0, 0, 0,
                               0, 0, 0,
                               0, 0, 0] );
        else
            return Matrix( 9, arguments );
    };
    
    this.matrix3 = {
    };

    this.Matrix4 = function() {
        if( 0 === arguments.length )
            return Matrix( 16, [0, 0, 0, 0,
                               0, 0, 0, 0,
                               0, 0, 0, 0,
                               0, 0, 0, 0] );
        else
            return Matrix( 16, arguments );
    };
    
    // Construct a 4x4 translation matrix from a Vector3.
    this.TranslationMatrix4 = function() {
        if( 0 === arguments.length )
            return Matrix( 16, that.matrix4.identity );
        else if( 1 === arguments.length ) {
            var v = arguments[0];
            var x = v[0],
            y = v[1],
            z = v[2];
            return Matrix( 16, [1, 0, 0, x,
                                0, 1, 0, y,
                                0, 0, 1, z,
                                0, 0, 0, 1] );
        } else
            return Matrix( 16, arguments );       
    };
    
    // Construct a 4x4 scale matrix from a Vector3.
    this.ScaleMatrix4 = function() {
        if( 0 === arguments.length )
            return Matrix( 16, that.matrix4.identity );
        else if( 1 === arguments.length ) {
            var v = arguments[0];
            var x = v[0],
                y = v[1],
                z = v[2];
            return Matrix( 16, [x, 0, 0, 0,
                                0, y, 0, 0,
                                0, 0, z, 0,
                                0, 0, 0, 1] );
        } else
            return Matrix( 16, arguments );
    };
    
    // Construct a 4x4 rotation matrix from a Quaternion.
    this.RotationMatrix4 = function() {
        if( 0 === arguments.length )
            return Matrix( 16, that.matrix4.identity );
        else if( 1 === arguments.length ) {
            var v = arguments[0];
            var x = v[0],
                y = v[1],
                z = v[2],
                w = v[3];
            return Matrix( 16, [1 - 2*y*y - 2*z*z, 2*x*y - 2*w*z, 2*x*z + 2*w*y, 0,
                                2*x*y + 2*w*z, 1-2*x*x - 2*x*x, 2*y*z + 2*w*x, 0,
                                2*x*z - 2*w*y, 2*y*z - 2*w*x, 1-2*x*x - 2*y*y, 0,
                                0, 0, 0, 1] );
        } else
            return Matrix( 16, arguments );
    };
    
    this.matrix4 = {
            
        clear: matrix.clear,
        
        equal: matrix.equal,

        multiply: function( m1, m2 ) {
            var r = new that.Matrix4();
            
            r[0] = a[0]*b[0] + a[1]*b[4] + a[2]*b[8] + a[3]*b[12];
            r[1] = a[0]*b[1] + a[1]*b[5] + a[2]*b[9] + a[3]*b[13];
            r[2] = a[0]*b[2] + a[1]*b[6] + a[2]*b[10] + a[3]*b[14];
            r[3] = a[0]*b[3] + a[1]*b[7] + a[2]*b[11] + a[3]*b[15];            
            r[4] = a[4]*b[0] + a[5]*b[4] + a[6]*b[8] + a[7]*b[12];
            r[5] = a[4]*b[1] + a[5]*b[5] + a[6]*b[9] + a[7]*b[13];
            r[6] = a[4]*b[2] + a[5]*b[6] + a[6]*b[10] + a[7]*b[14];
            r[7] = a[4]*b[3] + a[5]*b[7] + a[6]*b[11] + a[7]*b[15];
            r[8] = a[8]*b[0] + a[9]*b[4] + a[10]*b[8] + a[11]*b[12];
            r[9] = a[8]*b[1] + a[9]*b[5] + a[10]*b[9] + a[11]*b[13];
            r[10] = a[8]*b[2] + a[9]*b[6] + a[10]*b[10] + a[11]*b[14];
            r[11] = a[8]*b[3] + a[9]*b[7] + a[10]*b[11] + a[11]*b[15];
            r[12] = a[12]*b[0] + a[13]*b[4] + a[14]*b[8] + a[15]*b[12];
            r[13] = a[12]*b[1] + a[13]*b[5] + a[14]*b[9] + a[15]*b[13];
            r[14] = a[12]*b[2] + a[13]*b[6] + a[14]*b[10] + a[15]*b[14];
            r[15] = a[12]*b[3] + a[13]*b[7] + a[14]*b[11] + a[15]*b[15];

            return r;
        },
        
        imultiply: function( m1, m2 ) {
            var r = new that.Matrix4( m1 );
            
            r[0] = a[0]*b[0] + a[1]*b[4] + a[2]*b[8] + a[3]*b[12];
            r[1] = a[0]*b[1] + a[1]*b[5] + a[2]*b[9] + a[3]*b[13];
            r[2] = a[0]*b[2] + a[1]*b[6] + a[2]*b[10] + a[3]*b[14];
            r[3] = a[0]*b[3] + a[1]*b[7] + a[2]*b[11] + a[3]*b[15];            
            r[4] = a[4]*b[0] + a[5]*b[4] + a[6]*b[8] + a[7]*b[12];
            r[5] = a[4]*b[1] + a[5]*b[5] + a[6]*b[9] + a[7]*b[13];
            r[6] = a[4]*b[2] + a[5]*b[6] + a[6]*b[10] + a[7]*b[14];
            r[7] = a[4]*b[3] + a[5]*b[7] + a[6]*b[11] + a[7]*b[15];
            r[8] = a[8]*b[0] + a[9]*b[4] + a[10]*b[8] + a[11]*b[12];
            r[9] = a[8]*b[1] + a[9]*b[5] + a[10]*b[9] + a[11]*b[13];
            r[10] = a[8]*b[2] + a[9]*b[6] + a[10]*b[10] + a[11]*b[14];
            r[11] = a[8]*b[3] + a[9]*b[7] + a[10]*b[11] + a[11]*b[15];
            r[12] = a[12]*b[0] + a[13]*b[4] + a[14]*b[8] + a[15]*b[12];
            r[13] = a[12]*b[1] + a[13]*b[5] + a[14]*b[9] + a[15]*b[13];
            r[14] = a[12]*b[2] + a[13]*b[6] + a[14]*b[10] + a[15]*b[14];
            r[15] = a[12]*b[3] + a[13]*b[7] + a[14]*b[11] + a[15]*b[15];

            return r;

        }

    };
    
    const _matrix4_identity = new this.Matrix4( [1, 0, 0, 0,
                                                 0, 1, 0, 0,
                                                 0, 0, 1, 0,
                                                 0, 0, 0, 1]);
    Object.defineProperty( this.matrix4, 'identity', {
        get: function() {
            return _matrix4_identity;
        }
    });

}  

window.math = new _Math();
