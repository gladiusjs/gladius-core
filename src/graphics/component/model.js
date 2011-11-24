/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    return function( engine ) {        
        
        var math = engine.math;
        var Component = require( '../../core/component' );
        var Event = require( '../../core/event' );

        var thisType = 'Model';

        var Model = function( options ) {

            option = options || {};
            var _that = this,
                _mesh = options.mesh;

            Object.defineProperty( this, "mesh", {
                enumerable: true,
                get: function() {
                    return _mesh;
                }
            });

        };
        Model.prototype = new Component({
            type: thisType
        });
        Model.prototype.constructor = Model;
        
        return Model;
        
    };

});
