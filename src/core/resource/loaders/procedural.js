/*jshint white: false, strict: false, plusplus: false, onevar: false,
 nomen: false */
/*global define: false, console: false */

define(function(require) {

    var lang = require('lang');

    return function( engine ) {
        
        return function(url, onsuccess, onfailure) {

            var scriptLocation = url.split( "?" )[0];
            var scriptOptions = lang.getURLParams(url);
            engine.core.resource.get([{
                url : scriptLocation,
                type : engine.core.resource.Script,
                onsuccess : function(instance) {
                    try {
                        var data = instance.run( scriptOptions );
                        onsuccess( data ) ;
                    } catch ( e ) {
                        onfailure( e );
                    } 
                },
                onfailure : onfailure
            }]);

        };

    };
});
