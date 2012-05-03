define(function(require) {

  var defaultLoad = require( 'core/loaders/default' );

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

    var doLoad = function( load, request ) {
      load(
        request.url,
        function loadSuccess(data) {
          if(undefined === data) {
            request.onfailure('load returned with not data');
          } else {
            var instance = new request.type(data);
            request.onsuccess(instance);
          }
          requestHandled();
        },
        function loadFailure(error) {
          request.onfailure('load failed: ' + error);
          requestHandled();
        }
      );
    };

    for(var i = 0; i < requests.length; i++) {
      var request = requests[i];
      var load = request.load || defaultLoad;
      doLoad( load, request );
    }
    return;
  };

  return get;
});
