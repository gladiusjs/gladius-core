/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

  function Spatial( engine, options ) {

      var _position = options && options.position ? options.position : engine.math.Vector3.$( 0, 0, 0 );   // X, Y, Z
      var _rotation = options && options.rotation ? options.rotation : engine.math.Vector3.$( 0, 0, 0 );   // Roll, pitch, yaw
      
      Object.defineProperty( this, 'position', {
         get: function() {
             return _position;
         },
         set: function( value ) {
             for( var i = 0; i < _position.length; ++ i )
                 _position[i] = value[i];
         }
      });
      
      Object.defineProperty( this, 'rotation', {
          get: function() {
              return _rotation;
          },
          set: function( value ) {
              for( var i = 0; i < _rotation.length; ++ i )
                  _rotation[i] = value[i];
          }          
      } );

  }

  return Spatial;
});
