/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    var _Math = function( options ) {

        var that = this;

        var assert = function( condition, message ) {
            if( !condition ) {
                throw message;
            }
        };

        var FLOAT_ARRAY_ENUM = {
                Float32: Float32Array,
                Float64: Float64Array
        };

        // Building Block (Vector/Matrices constructed from this)
        var FLOAT_ARRAY_TYPE = FLOAT_ARRAY_ENUM.Float32;

        Object.defineProperty( this, 'ARRAY_TYPE', {
            get: function() {
                return FLOAT_ARRAY_TYPE;
            }
        });

//      ** Vector Functions **
        var Vector = function( dim, args ) {
            var elements = null;
            if( 1 === args.length ) {
                elements = args[0];
            } else {
                elements = args;
            }
            
            var vector = new FLOAT_ARRAY_TYPE( dim );
            for( var i = 0; i < dim; ++ i ) {
                vector[i] = elements[i];
            }

            return vector;
        };

        // Functions used by all vector sizes
        var vector = {

                // Vector(v1) + Vector(v2) -> Vector(result)
                add: function( v1, v2, result ) {
                    for( var i = 0; i < v1.length; ++ i ) {
                        result[i] += v1[i] + v2[i];
                    }

                    return result;
                },

                // Set all elements of v to zero
                clear: function( v ) {
                    for( var i = 0; i < v.length; ++ i ) {
                        v[i] = 0;
                    }
                },

                // Computes the dot product of v1 and v2
                dot: function( v1, v2 ) {
                    var res = 0;
                    for( var i = 0; i < v1.length; ++ i) {
                        res += v1[i] * v2[i];
                    }
                    return res;
                },

                //Returns true if v1 == v2, false otherwise.
                equal: function( v1, v2 ) {
                    if( v1.length != v2.length ) {
                        return false;
                    }

                    var dim = v1.length;
                    for( var i = 0; i < dim; ++ i ) {
                        if( v1[i] != v2[i] ) {
                            return false;
                        }
                    }

                    return true;
                },

                // Computes the length of Vector(v)
                length: function( v ) {
                    var va = 0;
                    for( var i = 0; i < v.length; ++ i ) {
                        va += v[i] * v[i];
                    }

                    return Math.sqrt(va);
                },

                // Vector(v) * Scalar(s) -> Vector(result)
                multiply: function( v, s, result ) {
                    for( var i = 0; i < v.length; ++ i ) {
                        result[i] = v[i] * s;
                    }

                    return result;
                },

                // Return a Vector(result) with same direction as v having unit length
                normalize: function( v, result ) {
                    // Need to find |v| not v.length (length of array)
                    for( var i = 0, len = vector.length(v); i < len; ++ i ) {
                        result[i] = v[i] / len;
                    }

                    return result;
                },

                // Computes Vector(v1) - Vector(v2) -> Vector(result)
                subtract: function( v1, v2, result) {
                    for( var i = 0; i < v1.length; ++ i ) {
                        result[i] = v1[i] - v2[i];
                    }

                    return result;
                }        
        };

        // Constructor
        this.Vector2 = function() {
            if( 0 === arguments.length ) {
                return Vector( 2, [0, 0] );
            } else {
                return Vector( 2, arguments );
            }
        };

        this.vector2 = {

                // Computes v1 + v2
                add: function( v1, v2, result ) {
                    result = result || that.Vector2();

                    return vector.add( v1, v2, result );
                },

                // Computes the angle between v1 and v2
                angle: function( v1, v2 ) {
                    // Angle = acos( |v1| . |v2| )
                    var nV1 = that.Vector2();
                    var nV2 = that.Vector2();

                    vector.normalize(v1, nV1);
                    vector.normalize(v2, nV2);

                    return Math.acos(vector.dot(nV1,nV2));
                },

                clear: vector.clear,

                dot: vector.dot,

                equal: vector.equal,

                length: vector.length,

                // Computes v * s -> result
                multiply: function( v, s, result ) {
                    result = result || that.Vector2();

                    return vector.multiply( v, s, result );
                },

                // Computes a Vector2 with same direction as v having unit length
                normalize: function( v, result ) {
                    result = result || that.Vector2();

                    return vector.normalize( v, result );
                },

                // Computes v1 - v2 -> result
                subtract: function( v1, v2, result ) {
                    result = result || that.Vector2();

                    return vector.subtract( v1, v2, result );
                }
        };

        this.Vector3 = function() {
            if( 0 === arguments.length ) {
                return Vector( 3, [0, 0, 0] );
            } else {
                return Vector( 3, arguments );
            }
        };

        this.vector3 = {

                add: function( v1, v2 ) {
                    return [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]];
                },

                iadd: vector.iadd,

                angle: function( v1, v2 ) {
                    return Math.acos(
                            (v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2]) /
                            (Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1] + v1[2] * v1[2]) *
                                    Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1] + v2[2] * v2[2]))
                    );
                },

                cross: function( v1, v2 ) {
                    return [ v1[1] * v2[2] - v2[1] * v1[2], 
                             v1[2] * v2[0] - v2[2] * v1[0], 
                             v1[0] * v2[1] - v2[0] * v1[1] ];
                },

                dot: function( v1, v2 ) {
                    return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
                },

                equal: vector.equal,

                clear: vector.clear,

                length: function( v ) {
                    return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
                },

                multiply: function( v, s ) {
                    if (s.length === 16 ) {
                        return that.vector3.multiply_matrix4(v,s);
                    } else if (s.length === 9 ) {
                        return that.vector3.multiply_matrix3(v,s);
                    }

                    return [v[0] * s, v[1] * s, v[2] * s];
                },

                multiply_matrix3: function(v, m, out) {
                    out = out||[];

                    out[0] = m[0] * v[0] + m[3] * v[1] + m[6] * v[2];
                    out[1] = m[1] * v[0] + m[4] * v[1] + m[7] * v[2];
                    out[2] = m[2] * v[0] + m[5] * v[1] + m[8] * v[2];

                    return out;
                },

                multiply_matrix4: function (v, m, out) {
                    out = out||[];

                    out[0] = m2[0] * m1[0] + m2[4] * m1[1] + m2[8] * m1[2] + m2[12];
                    out[1] = m2[1] * m1[0] + m2[5] * m1[1] + m2[9] * m1[2] + m2[13];
                    out[2] = m2[2] * m1[0] + m2[6] * m1[1] + m2[10] * m1[2] + m2[14];

                    return out;
                },

                imultiply: vector.imultiply,

                normalize: function( v ) {
                    var l = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);

                    return [v[0]/l,v[1]/l,v[2]/l];
                },

                inormalize: vector.inormalize,

                subtract: function( v1, v2 ) {
                    return [ v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]];
                },

                isubtract: vector.isubtract
        };

        this.Vector4 = function() {
            if( 0 === arguments.length ) {
                return Vector( 4, [0, 0, 0, 0] );
            } else {
                return Vector( 4, arguments );
            }
        };

        this.vector4 = {

                add: function( v1, v2 ) {
                    return [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2], v1[3] + v2[3] ];
                },

                iadd: vector.iadd,

                angle: function( v1, v2 ) {
                },

                dot: function( v1, v2 ) {
                },

                equal: vector.equal,

                clear: vector.clear,

                length: function( v ) {
                    return Math.sqrt( v[0] * v[0] + v[1] * v[1] + v[2] * v[2] + v[3] * v[3] );
                },

                multiply: function( v, s ) {
                    if (s.length === 16 ) {
                        return that.vector4.multiply_matrix4(v,s);
                    }
                    return [v[0] * s, v[1] * s, v[2] * s, v[3] * s];
                },

                imultiply: vector.imultiply,

                multiply_matrix4: function( v, m, out ) {
                    out = out || [];

                    out[0] = m[0]*v[0] + m[4]*v[1] + m[8]*v[2] + m[12]*v[3];
                    out[1] = m[1]*v[0] + m[5]*v[1] + m[9]*v[2] + m[13]*v[3];
                    out[2] = m[2]*v[0] + m[6]*v[1] + m[10]*v[2] + m[14]*v[3];
                    out[3] = m[3]*v[0] + m[7]*v[1] + m[11]*v[2] + m[15]*v[3];

                    return out;
                },

                normalize: function( v ) {
                    var l = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2] + v[3] * v[3]);
                    return [v[0]/l,v[1]/l,v[2]/l,v[3]/l];
                },

                inormalize: vector.inormalize,

                subtract: function( v1, v2 ) {
                    return [ v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2], v1[3] - v2[3] ];
                },

                isubtract: vector.isubtract
        };

        this.Quaternion = function() {
            if( 0 === arguments.length ) {
                return Vector( 4, [0, 0, 0, 1] );
            } else {
                return Vector( 4, arguments );
            }
        };

        this.quaternion = {

                length: this.vector4.length,

                normalize: this.vector4.normalize,

                inormalize: this.vector4.inormalize,

                multiply: function( q1, q2 ) {
                    var r = that.Quaternion();

                    r[0] = q1[3] * q2[0] + q1[0] * q2[3] + q1[1] * q2[2] - q1[2] * q2[1];   // x
                    r[1] = q1[3] * q2[1] - q1[0] * q2[2] + q1[1] * q2[3] + q1[2] * q2[0];   // y
                    r[2] = q1[3] * q2[2] + q1[0] * q2[1] - q1[1] * q2[0] + q1[2] * q2[3];   // z
                    r[3] = q1[3] * q2[3] - q1[0] * q2[0] - q1[1] * q2[1] - q1[2] * q2[2];   // w

                    return r;
                },

                imultiply: function( q1, q2 ) {
                    var t1 = that.Quaternion( q1 );

                    q1[0] = t1[3] * q2[0] + t1[0] * q2[3] + t1[1] * q2[2] - t1[2] * q2[1];   // x
                    q1[1] = t1[3] * q2[1] - t1[0] * q2[2] + t1[1] * q2[3] + t1[2] * q2[0];   // y
                    q1[2] = t1[3] * q2[2] + t1[0] * q2[1] - t1[1] * q2[0] + t1[2] * q2[3];   // z
                    q1[3] = t1[3] * q2[3] - t1[0] * q2[0] - t1[1] * q2[1] - t1[2] * q2[2];   // w

                    return q1;
                }
        };

        // Vector Constants
        var _x = this.Vector4( 1.0, 0.0, 0.0, 0.0 );
        var _y = this.Vector4( 0.0, 1.0, 0.0, 0.0 );
        var _z = this.Vector4( 0.0, 0.0, 1.0, 0.0 );
        var _w = this.Vector4( 0.0, 0.0, 0.0, 1.0 );
        var _0 = this.Vector4( 0.0, 0.0, 0.0, 0.0 );
        var _1 = this.Vector4( 1.0, 1.0, 1.0, 1.0 );

        // X-Axis
        var _vector2_x = _x.subarray( 0, 2 );
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

        // Y-Axis
        var _vector2_y = _y.subarray( 0, 2 );
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

        // Zero Vector
        var _vector2_0 = _0.subarray( 0, 2 );
        Object.defineProperty( this.vector2, 'zero', {
            get: function() {
                return _vector2_0;
            }
        });
        var _vector3_0 = _0.subarray( 0, 3 );
        Object.defineProperty( this.vector3, 'zero', {
            get: function() {
                return _vector3_0;
            }
        });

        // Unit (1) Vector
        var _vector2_1 = _1.subarray( 0, 2 );
        Object.defineProperty( this.vector2, 'one', {
            get: function() {
                return _vector2_1;
            }
        });
        var _vector3_1 = _1.subarray( 0, 3 );
        Object.defineProperty( this.vector3, 'one', {
            get: function() {
                return _vector3_1;
            }
        });

        // Identity Quaternion
        var _quaternion_identity = this.Quaternion( 0, 0, 0, 1 );

        Object.defineProperty( this.quaternion, 'identity', {
            get: function() {
                return _quaternion_identity;
            }
        });
//      ** End Vector Functions **

//      ** Matrix Functions **
        var Matrix = function( dim, args ) {
            var elements = null;
            if( 1 === args.length ) {
                elements = args[0];
            } else {
                elements = args;
            }

            assert( elements.length >= dim,
                    'Invalid number of elements: ' + args.length );

            var matrix = new FLOAT_ARRAY_TYPE( dim );
            for( var i = 0; i < dim; ++ i ) {
                matrix[i] = elements[i];
            }

            return matrix;
        };

        var matrix = {

                // Return sum of 2 matrices
                iadd: function( m1, m2 ) {
                    for( var i = 0; i < m1.length; ++ i ) {
                        m1[i] += m2[i];
                    }
//                  Test
                    return m1;
                },

                // Return difference, m1 - m2
                isubtract: function( m1, m2 ) {
                    for( var i = 0; i < m1.length; ++ i ) {
                        m1[i] -= m2[i];
                    }
//                  Test
                    return m1;
                },

                clear: function( m ) {
                    for( var i = 0; i < m.length; ++ i ) {
                        m[i] = 0;
                    }
                },

                equal: function( m1, m2 ) {
                    if( m1.length != m2.length ) {
                        return false;
                    }

                    var dim = m1.length;
                    for( var i = 0; i < dim; ++ i ) {
                        if( m1[i] != m2[i] ) {
                            return false;
                        }
                    }

                    return true;
                }        
        };

        this.Matrix2 = function() {
            if( 0 === arguments.length ) {
                return Matrix( 4, [0, 0,
                                   0, 0] );
            } else {
                return Matrix( 4, arguments );
            }
        };

        this.matrix2 = {

                add: function( m1, m2 ) {
//                  Test
                    return [ m1[0] + m2[0], m1[1] + m2[1], m1[2] + m2[2], m1[3] + m2[3] ];
                },

                iadd: matrix.iadd,

                subtract: function( m1, m2 ) {
//                  Test
                    return [ m1[0] - m2[0], m1[1] - m2[1], m1[2] - m2[2], m1[3] - m2[3] ];
                },

                isubtract: matrix.isubtract,

                clear: matrix.clear,

                equal: matrix.equal,

                translate: function() {
                    if( 0 === arguments.length ) {
                        return Matrix( 4, that.matrix2.identity );
                    } else if( 1 === arguments.length ) {
                        var v = arguments[0];
                        var x = v[0],
                        y = v[1];
                        return Matrix( 4, [1 , x,
                                           0 , y] );
//                      Test
                    } else {
                        return Matrix( 4, arguments );       
                    }
                },

                // Construct a 2x2 scale matrix from a Vector3.
                scale: function() {
                    if( 0 === arguments.length ) {
                        return Matrix( 4, that.matrix2.identity );
                    } else if( 1 === arguments.length ) {
                        var v = arguments[0];
                        var x = v[0],
                        y = v[1];
                        return Matrix( 4, [x, 0,
                                           0, y] );
//                      Test                
                    } else {
                        return Matrix( 4, arguments );
                    }
                },

                // Construct a 2x2 rotation matrix from a Quaternion.
                rotate: function() {
                    if( 0 === arguments.length ) {
                        return Matrix( 4, that.matrix2.identity );
                    } else if( 1 === arguments.length ) {
                        var v = arguments[0];
                        var r = v[0];
//                      return Matrix( 4, [] );
                        // Todo (Quaternion = w + xi + yj + zk)
                    } else {
                        return Matrix( 4, arguments );
                    }
                }
        };

        this.Matrix3 = function() {
            if( 0 === arguments.length ) {
                return Matrix( 9, [0, 0, 0,
                                   0, 0, 0,
                                   0, 0, 0] );
            } else {
                return Matrix( 9, arguments );
            }
        };

        this.matrix3 = {

                add: function( m1, m2 ) {
//                  Test
                    return [ m1[0] + m2[0], m1[1] + m2[1], m1[2] + m2[2], 
                             m1[3] + m2[3], m1[4] + m2[4], m1[5] + m2[5],
                             m1[6] + m2[6], m1[7] + m2[7], m1[8] + m2[8] ];
                },

                iadd: matrix.iadd,

                subtract: function( m1, m2 ) {
//                  Test
                    return [ m1[0] - m2[0], m1[1] - m2[1], m1[2] - m2[2], 
                             m1[3] - m2[3], m1[4] - m2[4], m1[5] - m2[5],
                             m1[6] - m2[6], m1[7] - m2[7], m1[8] - m2[8] ];
                },

                isubtract: matrix.isubtract,

                clear: matrix.clear,

                equal: matrix.equal,

                // Multiply and return in new matrix
                multiply: function( m1, m2 ) {
                    var r = that.Matrix3();

                    r = [m1[1]*m2[1] + m1[2]*m2[4] + m1[3]*m2[7], // 1, 2, 3
                         m1[1]*m2[2] + m1[2]*m2[5] + m1[3]*m2[8], 
                         m1[1]*m2[3] + m1[2]*m2[6] + m1[3]*m2[9],

                         m1[4]*m2[1] + m1[5]*m2[4] + m1[6]*m2[7], 
                         m1[4]*m2[2] + m1[5]*m2[5] + m1[6]*m2[8], // 4, 5, 6
                         m1[4]*m2[3] + m1[5]*m2[6] + m1[6]*m2[9],

                         m1[7]*m2[1] + m1[8]*m2[4] + m1[9]*m2[7], 
                         m1[7]*m2[2] + m1[8]*m2[5] + m1[9]*m2[8],
                         m1[7]*m2[3] + m1[8]*m2[6] + m1[9]*m2[9]];// 7, 8, 9
//                  Test
                    return r;
                },

                // Multiply and store in first operand
                imultiply: function( m1, m2 ) {
                    var r = that.Matrix3( m1 );

                    r = [m1[1]*m2[1] + m1[2]*m2[4] + m1[3]*m2[7], // 1, 2, 3
                         m1[1]*m2[2] + m1[2]*m2[5] + m1[3]*m2[8], 
                         m1[1]*m2[3] + m1[2]*m2[6] + m1[3]*m2[9],

                         m1[4]*m2[1] + m1[5]*m2[4] + m1[6]*m2[7], 
                         m1[4]*m2[2] + m1[5]*m2[5] + m1[6]*m2[8], // 4, 5, 6
                         m1[4]*m2[3] + m1[5]*m2[6] + m1[6]*m2[9],

                         m1[7]*m2[1] + m1[8]*m2[4] + m1[9]*m2[7], 
                         m1[7]*m2[2] + m1[8]*m2[5] + m1[9]*m2[8],
                         m1[7]*m2[3] + m1[8]*m2[6] + m1[9]*m2[9]];// 7, 8, 9
//                  Test               
                    return r;
                },

                translate: function() {
                    if( 0 === arguments.length ) {
                        return Matrix( 9, that.matrix3.identity );
                    } else if( 1 === arguments.length ) {
                        var v = arguments[0];
                        var x = v[0],
                        y = v[1],
                        z = v[2];
//                      return Matrix( 9, [] );
                        // TODO                
                    } else {
                        return Matrix( 9, arguments );       
                    }
                },

                // Construct a 3x3 scale matrix from a Vector3.
                scale: function() {
                    if( 0 === arguments.length ) {
                        return Matrix( 9, that.matrix3.identity );
                    } else if( 1 === arguments.length ) {
                        var v = arguments[0];
                        var x = v[0],
                        y = v[1],
                        z = v[2];
//                      return Matrix( 9, [] );
                        // TODO                
                    } else {
                        return Matrix( 9, arguments );
                    }
                },

                // Construct a 3x3 rotation matrix from a Quaternion.
                rotate: function() {
                    if( 0 === arguments.length ) {
                        return Matrix( 9, that.matrix3.identity );
                    } else if( 1 === arguments.length ) {
                        var v = arguments[0];
                        var x = v[0],
                        y = v[1],
                        z = v[2],
                        w = v[3];
//                      return Matrix( 9, [] );
                        // TODO
                    } else {
                        return Matrix( 9, arguments );
                    }
                },

                transpose: function(mat_in) {
                    var mat = mat_in.slice(0);
                    var a01 = mat[1], a02 = mat[2], a12 = mat[5];

                    mat[1] = mat[3];
                    mat[2] = mat[6];
                    mat[3] = a01;
                    mat[5] = mat[7];
                    mat[6] = a02;
                    mat[7] = a12;

                    return mat;
                },

                // perform a quick transpose of a 3x3 on the original matrix
                transpose_inline: function(mat) {
                    var a01 = mat[1], a02 = mat[2], a12 = mat[5];

                    mat[1] = mat[3];
                    mat[2] = mat[6];
                    mat[3] = a01;
                    mat[5] = mat[7];
                    mat[6] = a02;
                    mat[7] = a12;

                    return mat;
                }        
        };

        this.Matrix4 = function() {
            if( 0 === arguments.length ) {
                return Matrix( 16, [0, 0, 0, 0,
                                    0, 0, 0, 0,
                                    0, 0, 0, 0,
                                    0, 0, 0, 0] );
            } else {
                return Matrix( 16, arguments );
            }
        };


        this.matrix4 = {

                add: function( m1, m2 ) {
//                  Test
                    return [ m1[0] + m2[0], m1[1] + m2[1], m1[2] + m2[2], m1[3] + m2[3],
                             m1[4] + m2[4], m1[5] + m2[5], m1[6] + m2[6], m1[7] + m2[7], 
                             m1[8] + m2[8], m1[9] + m2[9], m1[10] + m2[10], m1[11] + m2[11], 
                             m1[12] + m2[12], m1[13] + m2[13], m1[14] + m2[14], m1[15] + m2[15] ];
                },

                iadd: matrix.iadd,

                subtract: function( m1, m2 ) {
//                  Test
                    return [ m1[0] - m2[0], m1[1] - m2[1], m1[2] - m2[2], m1[3] - m2[3],
                             m1[4] - m2[4], m1[5] - m2[5], m1[6] - m2[6], m1[7] - m2[7], 
                             m1[8] - m2[8], m1[9] - m2[9], m1[10] - m2[10], m1[11] - m2[11], 
                             m1[12] - m2[12], m1[13] - m2[13], m1[14] - m2[14], m1[15] - m2[15] ];
                },

                isubtract: matrix.isubtract,

                clear: matrix.clear,

                equal: matrix.equal,

                // Multiply and return in new matrix
                multiply: function( m1, m2 ) {
                    var r = that.Matrix4();

                    r[0] = m1[0]*m2[0] + m1[1]*m2[4] + m1[2]*m2[8] + m1[3]*m2[12];
                    r[1] = m1[0]*m2[1] + m1[1]*m2[5] + m1[2]*m2[9] + m1[3]*m2[13];
                    r[2] = m1[0]*m2[2] + m1[1]*m2[6] + m1[2]*m2[10] + m1[3]*m2[14];
                    r[3] = m1[0]*m2[3] + m1[1]*m2[7] + m1[2]*m2[11] + m1[3]*m2[15];            
                    r[4] = m1[4]*m2[0] + m1[5]*m2[4] + m1[6]*m2[8] + m1[7]*m2[12];
                    r[5] = m1[4]*m2[1] + m1[5]*m2[5] + m1[6]*m2[9] + m1[7]*m2[13];
                    r[6] = m1[4]*m2[2] + m1[5]*m2[6] + m1[6]*m2[10] + m1[7]*m2[14];
                    r[7] = m1[4]*m2[3] + m1[5]*m2[7] + m1[6]*m2[11] + m1[7]*m2[15];
                    r[8] = m1[8]*m2[0] + m1[9]*m2[4] + m1[10]*m2[8] + m1[11]*m2[12];
                    r[9] = m1[8]*m2[1] + m1[9]*m2[5] + m1[10]*m2[9] + m1[11]*m2[13];
                    r[10] = m1[8]*m2[2] + m1[9]*m2[6] + m1[10]*m2[10] + m1[11]*m2[14];
                    r[11] = m1[8]*m2[3] + m1[9]*m2[7] + m1[10]*m2[11] + m1[11]*m2[15];
                    r[12] = m1[12]*m2[0] + m1[13]*m2[4] + m1[14]*m2[8] + m1[15]*m2[12];
                    r[13] = m1[12]*m2[1] + m1[13]*m2[5] + m1[14]*m2[9] + m1[15]*m2[13];
                    r[14] = m1[12]*m2[2] + m1[13]*m2[6] + m1[14]*m2[10] + m1[15]*m2[14];
                    r[15] = m1[12]*m2[3] + m1[13]*m2[7] + m1[14]*m2[11] + m1[15]*m2[15];

                    return r;
                },

                // Multiply and store in first operand
                imultiply: function( m1, m2 ) {
                    var r = that.Matrix4( m1 );

                    r[0] = m1[0]*m2[0] + m1[1]*m2[4] + m1[2]*m2[8] + m1[3]*m2[12];
                    r[1] = m1[0]*m2[1] + m1[1]*m2[5] + m1[2]*m2[9] + m1[3]*m2[13];
                    r[2] = m1[0]*m2[2] + m1[1]*m2[6] + m1[2]*m2[10] + m1[3]*m2[14];
                    r[3] = m1[0]*m2[3] + m1[1]*m2[7] + m1[2]*m2[11] + m1[3]*m2[15];            
                    r[4] = m1[4]*m2[0] + m1[5]*m2[4] + m1[6]*m2[8] + m1[7]*m2[12];
                    r[5] = m1[4]*m2[1] + m1[5]*m2[5] + m1[6]*m2[9] + m1[7]*m2[13];
                    r[6] = m1[4]*m2[2] + m1[5]*m2[6] + m1[6]*m2[10] + m1[7]*m2[14];
                    r[7] = m1[4]*m2[3] + m1[5]*m2[7] + m1[6]*m2[11] + m1[7]*m2[15];
                    r[8] = m1[8]*m2[0] + m1[9]*m2[4] + m1[10]*m2[8] + m1[11]*m2[12];
                    r[9] = m1[8]*m2[1] + m1[9]*m2[5] + m1[10]*m2[9] + m1[11]*m2[13];
                    r[10] = m1[8]*m2[2] + m1[9]*m2[6] + m1[10]*m2[10] + m1[11]*m2[14];
                    r[11] = m1[8]*m2[3] + m1[9]*m2[7] + m1[10]*m2[11] + m1[11]*m2[15];
                    r[12] = m1[12]*m2[0] + m1[13]*m2[4] + m1[14]*m2[8] + m1[15]*m2[12];
                    r[13] = m1[12]*m2[1] + m1[13]*m2[5] + m1[14]*m2[9] + m1[15]*m2[13];
                    r[14] = m1[12]*m2[2] + m1[13]*m2[6] + m1[14]*m2[10] + m1[15]*m2[14];
                    r[15] = m1[12]*m2[3] + m1[13]*m2[7] + m1[14]*m2[11] + m1[15]*m2[15];

                    return r;
                },

                translate: function() {
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
                    } else {
                        return Matrix( 16, arguments );       
                    }
                },

                // Construct a 4x4 scale matrix from a Vector3.
                scale: function() {
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
                    } else {
                        return Matrix( 16, arguments );
                    }
                },

                // Construct a 4x4 rotation matrix from a Quaternion.
                rotate: function() {
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
                    } else {
                        return Matrix( 16, arguments );
                    }
                },

                // rotate by euler x,y,z
                rotateEuler: function() {
                    if( 0 === arguments.length )
                        return Matrix( 16, that.matrix4.identity );
                    else if( 1 === arguments.length ) {
                        var v = arguments[0];
                        var x = v[0],
                        y = v[1],
                        z = v[2];
//                      return Matrix( 16, [] );
                        // TODO
                    } else {
                        return Matrix( 16, arguments );
                    }
                },

                // rotate by euler angle + axis
                rotateEulerAxis: function() {
                    if( 0 === arguments.length )
                        return Matrix( 16, that.matrix4.identity );
                    else if( 2 === arguments.length ) {
                        var v = arguments[0];
                        var x = v[0],
                        y = v[1],
                        z = v[2];
//                      return Matrix( 16, [] );
                        // TODO
                    } else {
                        return Matrix( 16, arguments );
                    }
                },

                determinant: function (m) {
                    var a0 = m[0] * m[5] - m[1] * m[4];
                    var a1 = m[0] * m[6] - m[2] * m[4];
                    var a2 = m[0] * m[7] - m[3] * m[4];
                    var a3 = m[1] * m[6] - m[2] * m[5];
                    var a4 = m[1] * m[7] - m[3] * m[5];
                    var a5 = m[2] * m[7] - m[3] * m[6];
                    var b0 = m[8] * m[13] - m[9] * m[12];
                    var b1 = m[8] * m[14] - m[10] * m[12];
                    var b2 = m[8] * m[15] - m[11] * m[12];
                    var b3 = m[9] * m[14] - m[10] * m[13];
                    var b4 = m[9] * m[15] - m[11] * m[13];
                    var b5 = m[10] * m[15] - m[11] * m[14];

                    var det = a0 * b5 - a1 * b4 + a2 * b3 + a3 * b2 - a4 * b1 + a5 * b0;

                    return det;
                },

                transpose: function (m) {
                    return [m[0], m[4], m[8], m[12], m[1], m[5], m[9], m[13], m[2], m[6], m[10], m[14], m[3], m[7], m[11], m[15]];
                },

                inverse: function (m,m_inv) {
                    var a0 = m[0] * m[5] - m[1] * m[4];
                    var a1 = m[0] * m[6] - m[2] * m[4];
                    var a2 = m[0] * m[7] - m[3] * m[4];
                    var a3 = m[1] * m[6] - m[2] * m[5];
                    var a4 = m[1] * m[7] - m[3] * m[5];
                    var a5 = m[2] * m[7] - m[3] * m[6];
                    var b0 = m[8] * m[13] - m[9] * m[12];
                    var b1 = m[8] * m[14] - m[10] * m[12];
                    var b2 = m[8] * m[15] - m[11] * m[12];
                    var b3 = m[9] * m[14] - m[10] * m[13];
                    var b4 = m[9] * m[15] - m[11] * m[13];
                    var b5 = m[10] * m[15] - m[11] * m[14];

                    var determinant = a0 * b5 - a1 * b4 + a2 * b3 + a3 * b2 - a4 * b1 + a5 * b0;

                    if (determinant !== 0) {
                        if (m_inv === undef) m_inv = [];

                        m_inv[0] = 0 + m[5] * b5 - m[6] * b4 + m[7] * b3;
                        m_inv[4] = 0 - m[4] * b5 + m[6] * b2 - m[7] * b1;
                        m_inv[8] = 0 + m[4] * b4 - m[5] * b2 + m[7] * b0;
                        m_inv[12] = 0 - m[4] * b3 + m[5] * b1 - m[6] * b0;
                        m_inv[1] = 0 - m[1] * b5 + m[2] * b4 - m[3] * b3;
                        m_inv[5] = 0 + m[0] * b5 - m[2] * b2 + m[3] * b1;
                        m_inv[9] = 0 - m[0] * b4 + m[1] * b2 - m[3] * b0;
                        m_inv[13] = 0 + m[0] * b3 - m[1] * b1 + m[2] * b0;
                        m_inv[2] = 0 + m[13] * a5 - m[14] * a4 + m[15] * a3;
                        m_inv[6] = 0 - m[12] * a5 + m[14] * a2 - m[15] * a1;
                        m_inv[10] = 0 + m[12] * a4 - m[13] * a2 + m[15] * a0;
                        m_inv[14] = 0 - m[12] * a3 + m[13] * a1 - m[14] * a0;
                        m_inv[3] = 0 - m[9] * a5 + m[10] * a4 - m[11] * a3;
                        m_inv[7] = 0 + m[8] * a5 - m[10] * a2 + m[11] * a1;
                        m_inv[11] = 0 - m[8] * a4 + m[9] * a2 - m[11] * a0;
                        m_inv[15] = 0 + m[8] * a3 - m[9] * a1 + m[10] * a0;

                        var inverse_det = 1.0 / determinant;

                        m_inv[0] *= inverse_det;
                        m_inv[1] *= inverse_det;
                        m_inv[2] *= inverse_det;
                        m_inv[3] *= inverse_det;
                        m_inv[4] *= inverse_det;
                        m_inv[5] *= inverse_det;
                        m_inv[6] *= inverse_det;
                        m_inv[7] *= inverse_det;
                        m_inv[8] *= inverse_det;
                        m_inv[9] *= inverse_det;
                        m_inv[10] *= inverse_det;
                        m_inv[11] *= inverse_det;
                        m_inv[12] *= inverse_det;
                        m_inv[13] *= inverse_det;
                        m_inv[14] *= inverse_det;
                        m_inv[15] *= inverse_det;

                        return m_inv;
                    }

                    return null; 
                },

                // return inverse 3x3, better performance than using 4x4 for normal matrix
                inverse_matrix3: function(mat) {
                    var dest = [];

                    var a00 = mat[0], a01 = mat[1], a02 = mat[2],
                    a10 = mat[4], a11 = mat[5], a12 = mat[6],
                    a20 = mat[8], a21 = mat[9], a22 = mat[10];

                    var b01 = a22*a11-a12*a21,
                    b11 = -a22*a10+a12*a20,
                    b21 = a21*a10-a11*a20;

                    var d = a00*b01 + a01*b11 + a02*b21;
                    if (!d) { return null; }
                    var id = 1/d;

                    dest[0] = b01*id;
                    dest[1] = (-a22*a01 + a02*a21)*id;
                    dest[2] = (a12*a01 - a02*a11)*id;
                    dest[3] = b11*id;
                    dest[4] = (a22*a00 - a02*a20)*id;
                    dest[5] = (-a12*a00 + a02*a10)*id;
                    dest[6] = b21*id;
                    dest[7] = (-a21*a00 + a01*a20)*id;
                    dest[8] = (a11*a00 - a01*a10)*id;

                    return dest;
                },       

                // efficient transposed inverse 3x3 of a 4x4 matrix
                normal_matrix3: function(m) {
                    return that.matrix3.transpose_inline(that.matrix4.inverse_matrix3(this.mvMatrix));
                }
        };

        // Identity Matrix 4x4
        var _matrix4_identity = this.Matrix4( [1, 0, 0, 0,
                                               0, 1, 0, 0,
                                               0, 0, 1, 0,
                                               0, 0, 0, 1] );                                       
        // Identity Matrix 3x3
        var _matrix3_identity = this.Matrix3( [1, 0, 0,
                                               0, 1, 0,
                                               0, 0, 1] );
        // Identity Matrix 2x2
        var _matrix2_identity = this.Matrix2( [1, 0,
                                               0, 1] );

        //slice() doesn't work with Float32Array
        Object.defineProperty( this.matrix4, 'identity', {
            get: function() {
                return _matrix4_identity;
            }
        });

        Object.defineProperty( this.matrix3, 'identity', {
            get: function() {
                return _matrix3_identity;
            }
        });

        Object.defineProperty( this.matrix2, 'identity', {
            get: function() {
                return _matrix2_identity;
            }
        });
//      ** End Matrix Functions **

        //  Pure stack controller, pass in a base type such as math.matrix4
        this.Transform = function(mtype,initial) {
            this.mtype = mtype;
            this.clearStack(initial);
        };

        this.Transform.prototype = {

                setIdentity: function() {
                    this.m_stack[this.c_stack] = this.mtype.identity;
                    if (this.valid === this.c_stack && this.c_stack) {
                        this.valid--;
                    }
                    return this;
                },

                invalidate: function() {
                    this.valid = 0;
                    this.result = null;
                    return this;
                },

                get: function() {
                    if (!this.c_stack) {
                        return this.m_stack[0];
                    }

                    var m = this.mtype.identity;

                    if (this.valid > this.c_stack-1) this.valid = this.c_stack-1;

                    for (var i = this.valid; i < this.c_stack+1; i++) {
                        m = this.mtype.multiply(m,this.m_stack[i]);
                        this.m_cache[i] = m;
                    }

                    this.valid = this.c_stack-1;          
                    this.result = this.m_cache[this.c_stack];

                    return this.result;
                },

                push: function(m) {
                    this.c_stack++;
                    this.m_stack[this.c_stack] = (m ? m : this.mtype.identity);
                    return this;
                },

                pop: function() {
                    if (this.c_stack === 0) {
                        return;
                    }
                    this.c_stack--;
                    return this;
                },

                clearStack: function(initial) {
                    this.m_stack.length = 0;
                    this.m_cache.length = 0;
                    this.c_stack = 0;
                    this.valid = 0;
                    this.result = null;

                    this.m_stack[0] = initial||this.mtype.identity;

                    return this;
                },

                invalidateTop: function() {
                    if (this.valid === this.c_stack && this.c_stack) {
                        this.valid--;
                    }          
                },

                translate: function(v) {
                    this.m_stack[this.c_stack] = this.mtype.multiply(this.mtype.translate(v),this.m_stack[this.c_stack]);

                    this.invalidateTop();
                },

                scale: function(v) {
                    this.m_stack[this.c_stack] = this.mtype.multiply(this.mtype.scale(v),this.m_stack[this.c_stack]);

                    this.invalidateTop();
                },

                rotate: function(quat) {       

                    this.m_stack[this.c_stack] = this.mtype.multiply(this.mtype.rotate(quat),this.m_stack[this.c_stack]);

                    this.invalidateTop();
                }
        };
    };

    return _Math;

});