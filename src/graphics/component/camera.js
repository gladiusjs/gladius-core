/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

	return function( engine ) {        

		var math = engine.math;
		var Component = require( '../../core/component' );
		var Delegate = require( '../../core/delegate' );

		return Component({
			type: 'Camera'
		},
		function( options ) {

			options = options || {};
			var _that = this;

			var _active = options.active !== undefined ? options.active : false;

			var _cvr = {
					camera: new CubicVR.Camera({
              calcNormalMatrix: true
          })
			};

      // This should be moved out of here, since it exists
      // only to create the camera's normal matrix before a render.
      // Probably should be fixed upstream in CubicVR.js (identity matrix, maybe).
      _cvr.camera.position = [0, 0, 0];
      _cvr.camera.lookat([0, 0, -1]);

			Object.defineProperty( this, "_cvr", {
				get: function() {
					return _cvr;
				}
			});

			Object.defineProperty( this, "active", {
				get: function() {
					return _active;
				},
				set: function( val ) {
					_active = val;
				}
			});

      var handleOwnerChanged = function( e ) {
      }; //ownerChangedHandler

      this.ownerChanged.subscribe( handleOwnerChanged );

		});

	};

});

