if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function ( require ) {
  "use strict";

  function getURLParams( url ) {
    var urlParts = url.split("?");
    var result = {};
    if( urlParts[1] ) {
      var params = urlParts[1].split("&");

      for ( var i = 0; i < params.length; ++i ) {
        var item = params[i].split("=");
        var key = decodeURIComponent(item[0]);
        var val = decodeURIComponent(item[1]);
        result[key] = val;
      }
    }

    return result;
  }
  return getURLParams;
});