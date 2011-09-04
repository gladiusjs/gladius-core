/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

  var Math = function( engine, options ) {

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

        engine.assert( elements.length === dim,
                'Invalid number of elements: ' + args.length );

        var vector = new FLOAT_ARRAY_TYPE( dim );
        for( var i = 0; i < dim; ++ i )
            vector[i] = elements[i];

        return vector;
    };

    this.Vector2 = function() {
        return Vector( 2, arguments );
    };
    this.vector2 = {
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

  return Math;

});
