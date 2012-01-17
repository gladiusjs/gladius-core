/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

  return function( engine, service, context ) { 

    var math = engine.math;
    var Component = require( 'base/component' );
    var Delegate = require( 'common/delegate' );

    return Component({
      type: 'Camera',
      depends: 'Transform'
    },
    function( options ) {

      options = options || {};
      var _that = this,
          _target = [0, 0, 0],
          _transform;

      var _active = options.active !== undefined ? options.active : false;

      var canvas = context.getCanvas();

      var _cvr = {
          camera: new context.Camera({
              width: options.width || canvas.width,
              height: options.height || canvas.height,
              fov: options.fov || 60,
              calcNormalMatrix: true
          })
      };

      // This should be moved out of here, since it exists
      // only to create the camera's normal matrix before a render.
      // Probably should be fixed upstream in CubicVR.js (identity matrix, maybe).
      _cvr.camera.position = [0, 0, 0];

      Object.defineProperty( this, "_cvr", {
        get: function() {
          return _cvr;
        }
      });

      Object.defineProperty( this, "active", {
        get: function() {
          return _active;
        },
        set: function( val ){
          _active = val;
        }
      });

      Object.defineProperty( this, "target", {
        get: function() {
          return _target;
        },
        set: function( val ){
          _target = val;
        }
      });

      var handleOwnerChanged = function( e ){
          _transform = e.current.find( "Transform" );
      }; //ownerChangedHandler
      this.ownerChanged.subscribe( handleOwnerChanged );

      this.prepareForRender = function(){
          if( _transform ){
            _cvr.camera.position = _transform.position;
            _cvr.camera.lookat( _target );
          } //if
      }; //prepareForRender

    });

  };

});

