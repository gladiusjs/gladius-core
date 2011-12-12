/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

	return function( engine ) {

		var math = engine.math;
		var Component = require( '../component' );
		
		/*
		 * The algorithm below is based on the discussion of action lists here:
		 * http://sonargame.com/2011/06/05/action-lists/
		 */

		return Component({
			type: 'Logic'
		},
		function( options ) {

			options = options || {};

			var _list = [],
			_blockMask = 0,
			_index = 0;

			var update = function( time ) {			
				while( _index < _list.length ) {
					var action = _list[_index];

					if( action.mask & _blockMask ) {
						continue;
					}

					if( action.update.call( this ) ) {
					    _list.splice( _index, 1 );
					    continue;
					}
					
					if( action.blocking ) {
					    _blockMask |= action.mask;
					}
					
					++ _index;
				}
			};

		});

	};

});
