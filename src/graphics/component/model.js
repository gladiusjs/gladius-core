/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

  return function( engine, service, context ) {

    var math = engine.math;
    var Component = require( 'base/component' );
    var Delegate = require( 'common/delegate' )

    return Component({
      type: 'Model',
      depends: 'Transform'
    },
    function( options ) {

      options = options || {};

      var _this = this;

      var _mesh = options.mesh || null,
          _material = options.material || null;

      Object.defineProperty( this, "mesh", {
          enumerable: true,
          get: function(){
              return _mesh;
          },
          set: function( val ){
              _mesh = val;
              _this.prepare();
          }
      });

      Object.defineProperty( this, "material", {
          enumerable: true,
          get: function(){
              return _material;
          },
          set: function( val ){
              _material = val;
              _this.prepare();
          }
      });

      this.prepare = function(){
          if( _mesh && _material && _mesh._cvr && _material._cvr ) {
              _mesh.prepare({
                  material: _material
              });
              if( options.onready ) {
                  options.onready( _this );
              } //if
          } //if
      }; //prepare

      var handleOwnerChanged = function( e ) {
      }; //ownerChangedHandler

      this.ownerChanged.subscribe( handleOwnerChanged );

      _this.prepare();

    });

  };

});
