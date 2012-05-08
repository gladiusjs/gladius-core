define(function(require) {

  var decodeDataURI = require( "common/decode-data-uri" );
  var decodeJavaScriptURI = require( "common/decode-javascript-uri" );

  return function(url, onsuccess, onfailure) {
    if( url.match('^data:') ) {
      onsuccess( decodeDataURI( url ) );
    } else if( url.match( '^javascript:' ) ) {
      onsuccess( decodeJavaScriptURI( url ) );
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