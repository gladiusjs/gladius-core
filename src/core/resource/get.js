/*jshint white: false, strict: false, plusplus: false, onevar: false,
 nomen: false */
/*global define: false, console: false */

define(function(require) {

  var decodeDataURI = function(uri) {
    var components = uri.match( ':.*,' )[0].slice(1, -1).split(';');
    var contentType = components[0], encoding = components[1], base64 = components[2];
    var data = decodeURIComponent(uri.match( ',.*' )[0].slice(1));

    switch( contentType ) {
      case '':
      case 'text/plain':
        return data;
      default:
        throw 'unknown content type: ' + contentType;
    }
  };
  var defaultLoad = function(url, onsuccess, onfailure) {
    if(url.match('^data:')) {
      onsuccess(decodeDataURI(url));
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
  var get = function resourceGet(requests, options) {

    if(!requests.length) {
      if("oncomplete" in options) {
        options.oncomplete();
      }

      return;
    }

    for(var i = 0; i < requests.length; i++) {
      //var itemOptions = new makeItemOptions(itemsToLoad[i]);
      //var resource = new engine.base.Resource()(itemOptions);
      var request = requests[i];
      defaultLoad(request.url, function loadSuccess(data) {
        if(undefined === data) {
          request.onfailure('load returned with not data');
          return;
        }
        var instance = new request.type(data);

        request.onsuccess(instance);
      }, function loadFailure(error) {
        request.onfailure('load failed: ' + error);
      });
    }
    return;
  };

  return get;
});
