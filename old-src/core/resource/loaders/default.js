/*jshint white: false, strict: false, plusplus: false, onevar: false,
 nomen: false */
/*global define: false, console: false */

define(function(require) {

    var lang = require( 'lang' );

    return function(url, onsuccess, onfailure) {
        if( url.match('^data:') ) {
            onsuccess( lang.decodeDataURI( url ) );
        } else if( url.match( '^javascript:' ) ) {
            onsuccess( lang.decodeJavaScriptURI(url) );
        } else {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.onreadystatechange = function() {
                if(4 != xhr.readyState) {
                    return;
                }
                if(xhr.status < 200 || xhr.status > 299) {
                    onfailure(xhr.statusText);
                    return;
                }
                onsuccess(xhr.responseText);
            };
            xhr.send(null);
        }
    };

});