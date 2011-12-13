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

			option = options || {};
			var _that = this;

			var _active = false;

			var _cvr = {
					camera: new CubicVR.Camera()
			};

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

