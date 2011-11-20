/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    return function( engine ) {
        
        var Logic = function( options ) {

            option = options || {};

        };
        Logic.prototype = new engine.Component({
            type: 'Logic'
        });
        Logic.prototype.constructor = Logic;
        
        return Logic;
        
    };

});
