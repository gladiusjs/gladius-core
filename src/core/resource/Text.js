/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    return function( engine ) {

        var Resource = require( '../Resource' );

        var TextLoader = function( options ) {
            options = options || {};

            var onComplete = options.onComplete,
                onError = options.onError,
                url = options.url;

            var xmlhttp = new XMLHttpRequest();
            xmlhttp.open( 'GET', url, true );
            xmlhttp.onreadystatechange = function() {
                if( 4 != xmlhttp.readyState ) {
                    return;
                }
                console.log( 'response: ', xmlhttp.responseText );
                onComplete( xmlhttp.responseText );
            };
            xmlhttp.send( null );
        };
        
        var Text = new Resource({
            type: 'Text',
            load: TextLoader,
            cache: null
        });
        
        return Text;
        
    };

});
