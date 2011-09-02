/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {
  function Spatial( paladin, options ) {

      var _position = options && options.position ? options.position : [0, 0, 0];   // X, Y, Z
      var _rotation = options && options.rotation ? options.rotation : [0, 0, 0];   // Roll, pitch, yaw
      
      Object.defineProperty( this, 'position', {
         get: function() {
             return _position;
         },
         set: function( value ) {
             if( value.length != _position.length )
                 throw 'position requires ' + _position.length + ' components, ' + value.length + ' given';
             for( var i = 0; i < _position.length; ++ i )
                 _position[i] = value[i];
         }
      });
      
      Object.defineProperty( this, 'rotation', {
          get: function() {
              return _rotation;
          },
          set: function( value ) {
              if( value.length != _rotation.length )
                  throw 'rotation requires ' + _rotation.length + ' components, ' + value.length + ' given';
              for( var i = 0; i < _rotation.length; ++ i )
                  _rotation[i] = value[i];
          }          
      } );

  }

  return Spatial;
});
