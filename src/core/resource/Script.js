/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    // source.text : script body
    // source.parameters : parameter names
    var Script = function( source ) {

        source = source || {};
        source.text = source.text || '';
        source.parameters = source.parameters || [];

        var _script = new Function( source.parameters, source.text );
        Object.defineProperty( this, 'call', {
            get: function() {
                return _script.call;
            }
        });
        Object.defineProperty( this, 'apply', {
            get: function() {
                return _script.apply;
            }
        });

    };

    return Script;

});

