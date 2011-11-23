/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    return function( engine ) {        
        
        var math = engine.math;
        var Component = require( '../component' );
        var Event = require( '../event' );

        var thisType = 'Model';

        var Model = function( options ) {

            option = options || {};
            var that = this;
            
            var _mesh = options.mesh || null;
            var _material = options.material || null;

        };
        Model.prototype = new Component({
            type: thisType
        });
        Model.prototype.constructor = Model;
        
        return Model;
        
    };

});
