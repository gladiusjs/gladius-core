/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    var Resource = require( '../Resource' );

    // source.text : script body
    // source.parameters : parameter names
    var Script = function( source ) {

        source = source || {};
        source.text = source.text || '';
        source.parameters = source.parameters || [];

        var _script = new Function( source.parameters, source.text );
        Object.defineProperty( this, 'run', {
            get: function() {
                return _script;
            }
        });

    };

    return new Resource({
        type: 'Script',
        object: Script
    });

});

