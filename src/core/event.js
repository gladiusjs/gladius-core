/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    var lang = require( './lang' );

    var Event = function( type, options ) {

        var that = this;

        type = type || '';
        Object.defineProperty( this, 'type', {
            get: function() {
                return type;
            }
        });

        options = options || {};
        lang.extend( this, options );

        // Send this event to each entity in targets
        this.send = function( targets ) {
            for( var i = 0, l = targets.length; i < l; ++ i ) {
                targets[i].handleEvent( that );
            }
        };

    };

    return Event;

});