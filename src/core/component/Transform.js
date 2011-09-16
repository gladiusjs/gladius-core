/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    var Component = require( 'core/Component' );
    var _Math = require( 'common/Math' );

    var Transform = function( options ) {

        option = options || {};

    };
    Transform.prototype = new Component({
        type: 'Transform',
        depends: []
    });
    Transform.prototype.constructor = Transform;

    return Transform;

});
