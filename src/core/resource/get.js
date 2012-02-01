/*jshint white: false, strict: false, plusplus: false, onevar: false,
 nomen: false */
/*global define: false, console: false */

define(function(require) {
    
    var defaultLoad = require( 'core/resource/loaders/default' );

    var get = function resourceGet(requests, options) {

        options = options || {};
        options.oncomplete = options.oncomplete || function () {};
        
        if(!requests.length) {
            options.oncomplete();
            return;
        }

        var requestsHandled = 0;
        var requestHandled = function() {
            ++ requestsHandled;
            if( requestsHandled === requests.length ) {
                options.oncomplete();
            }
        };

        for(var i = 0; i < requests.length; i++) {
            var request = requests[i];
            var load = request.load || defaultLoad;
            
            load(request.url,
            function loadSuccess(data) {
                requestHandled();
                if(undefined === data) {
                    request.onfailure('load returned with not data');
                    return;
                }
                var instance = new request.type(data);

                request.onsuccess(instance);
            },
            function loadFailure(error) {
                requestHandled();
                request.onfailure('load failed: ' + error);          
            }
            );
        }
        return;
    };

    return get;
});
