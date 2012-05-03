if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function ( require ) {
  "use strict";

  function decodeDataUri(uri) {
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
  }

  return decodeDataUri;

});

