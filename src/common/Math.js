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

    this.vector = {

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
        return Vector( 2, arguments );
    };
    this.vector2 = {

        add: function( v1, v2 ) {
            assert( v1.length === v2.length,
                'v1 and v2 must have the same number of components' );

            return new that.Vector2(
                v1[0] + v2[0],
                v1[1] + v2[1]
            );
        },

        iadd: this.vector.iadd,

        angle: function() {},

        cross: function() {},        

        dot: function() {},

        equal: this.vector.equal,

        length: function( v ) {
            return Math.sqrt( v[0] * v[0] + v[1] * v[1] );
        },

        multiply: function( v, s ) {
            var w = new that.Vector2( v[0], v[1] );

            for( var i = 0; i < w.length; ++ i )
                w[i] *= s;

            return w;
        },

        imultiply: this.vector.imultiply,

        normal: function() {},

        normalize: function() {},

        subtract: function( v1, v2 ) {
            assert( v1.length === v2.length,
                'v1 and v2 must have the same number of components' );

            return new that.Vector2(
                v1[0] - v2[0],
                v1[1] - v2[1]
            );
        },

        isubtract: this.vector.isubtract

    };

    this.Vector3 = function() {
        return Vector( 3, arguments );
    };
    this.vector3 = {


    };

    this.Vector4 = function() {
        return Vector( 4, arguments );
    };
    this.vector4 = {

    };

    var _x = new this.Vector4( 1.0, 0.0, 0.0, 0.0 );
    var _y = new this.Vector4( 0.0, 1.0, 0.0, 0.0 );
    var _z = new this.Vector4( 0.0, 0.0, 1.0, 0.0 );
    var _w = new this.Vector4( 0.0, 0.0, 0.0, 1.0 );
    var _0 = new this.Vector4( 0.0, 0.0, 0.0, 0.0 );
    var _1 = new this.Vector4( 1.0, 1.0, 1.0, 1.0 );

    var _vector2_x = _x.subarray( 0, 2 );
    Object.defineProperty( this.vector2, 'x', {
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
