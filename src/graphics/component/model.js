/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

	return function( engine ) {        

		var math = engine.math;
		var Component = require( '../../core/component' );
		var Delegate = require( '../../core/delegate' );

		return Component({
			type: 'Model'
		},
		function( options ) {

			option = options || {};

			var _that = this;

			var _owner = null;
			Object.defineProperty( this, 'owner', {
				get: function() {
					return _owner;
				},
				set: function( value ) {
					if( value != _owner ) {
						_owner = value;
						onOwnerChanged( value );
					}
				}
			});

			var _ownerChanged = new Delegate();
			Object.defineProperty( this, 'ownerChanged', {
				get: function() {
					return _ownerChanged;
				}
			});
			var onOwnerChanged = function( options ) {
				if( _ownerChanged ) {
					_ownerChanged( options );
				}
			};

			var _mesh = options.mesh || null;
			_material = options.material || null;

			Object.defineProperty( this, "mesh", {
				enumerable: true,
				get: function() {
					return _mesh;
				}
			});

		});

	};

});
