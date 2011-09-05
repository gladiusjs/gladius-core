/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

  function Spatial( engine, options ) {

      var _position = options && options.position ? options.position : new engine.math.Vector3( 0, 0, 0 );   // X, Y, Z
      var _rotation = options && options.rotation ? options.rotation : new engine.math.Vector3( 0, 0, 0 );   // Roll, pitch, yaw
      var _direction = new engine.math.Vector3( 0, 0, 0 );
      var _scale = 1.0;
      
      Object.defineProperty( this, 'position', {
         get: function() {
             return _position;
         },
         set: function( value ) {
             for( var i = 0; i < 3; ++ i )
                 _position[i] = value[i];
         }
      });
      
      Object.defineProperty( this, 'rotation', {
          get: function() {
              return _rotation;
          },
          set: function( value ) {
              for( var i = 0; i < 3; ++ i )
                  _rotation[i] = value[i];
              // TODO: update direction when rotation changes.
          }          
      });

      Object.defineProperty( this, 'direction', {
          get: function() {
              return _direction;
          },
          set: function( value ) {
              for( var i = 0; i < 3; ++ i )
                  _direction[i] = value[i];
              // TODO: update rotation when direction changes.
          }
      });

      Object.defineProperty( this, 'scale', {
          get: function() {
              return _scale;
          },
          set: function( value ) {
              _scale = value;
          }
      });

  }

  return Spatial;

});
