if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function ( require ) {
  "use strict";

  function decodeJavaScriptUri( uri ) {
    /*jshint scripturl:true*/
    var js = uri.match( '^javascript://.*' )[0].slice( 'javascript://'.length );
    return decodeURIComponent( js );
  }

  return decodeJavaScriptUri;

});

