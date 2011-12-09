/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

	var Service = require( 'base/service' );

	return function( engine ) {

		var ActionListService = Service({
			type: 'Behavior',
			priority: {
				phase: 'Update',
				before: ['Animation'],
				after: ['Physics']
			}
		},
		function( options ) {

			this.update = function() {
				
			};
			
		});

		return ActionListService;

	};

});