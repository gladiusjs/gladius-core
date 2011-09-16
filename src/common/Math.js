/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

  var _Math = function( options ) {

    var FLOAT_ARRAY_ENUM = {
        Float32: Float32Array,
        Float64: Float64Array,
        Array: Array
    };
    const FLOAT_ARRAY_TYPE = FLOAT_ARRAY_ENUM.Float64;

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

        /*
        assert( elements.length === dim,
                'Invalid number of elements: ' + args.length );
        */

        var vector = new FLOAT_ARRAY_TYPE( dim );
        for( var i = 0; i < dim; ++ i )
            vector[i] = elements[i];

        return vector;
    };

    this.Vector2 = function() {
        return Vector( 2, arguments );
    };
    this.vector2 = {

        add: function() {},
        angle: function() {},
        cross: function() {},
        dot: function() {},
        equal: function() {},
        length: function( v ) {
            return Math.sqrt( v[0] * v[0] + v[1] * v[1] );
        },
        multiply: function() {},
        normal: function() {},
        normalize: function() {},
        subtract: function() {}

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

    const _x = new this.Vector4( 1.0, 0.0, 0.0, 0.0 );
    Object.defineProperty( this, 'x', {
        get: function() {
            return _x;
        }
    });
    Object.defineProperty( this, 'u', {
        get: function() {
            return _x;
        }
    });
    const _y = new this.Vector4( 0.0, 1.0, 0.0, 0.0 );
    Object.defineProperty( this, 'y', {
        get: function() {
            return _y;
        }
    });
    Object.defineProperty( this, 'v', {
        get: function() {
            return _y;
        }
    });
    const _z = new this.Vector4( 0.0, 0.0, 1.0, 0.0 );
    Object.defineProperty( this, 'z', {
        get: function() {
            return _z;
        }
    });
    const _w = new this.Vector4( 0.0, 0.0, 0.0, 1.0 );
    Object.defineProperty( this, 'w', {
        get: function() {
            return _w;
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
