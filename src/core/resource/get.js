/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false */

define( function ( require ) {

  return function ( engine ) {
      
      var decodeDataURI = function( uri ) {
          var components = uri.match( ':.*,' )[0].slice( 1, -1 ).split( ';' );
          var contentType = components[0],
          encoding = components[1],
          base64 = components[2];
          var data = decodeURIComponent( uri.match( ',.*' )[0].slice( 1 ) );

          switch( contentType ) {
          case '':
          case 'text/plain':
              return data;
          default:
              throw 'unknown content type: ' + contentType;
          }
      };

      var defaultLoad = function( url, onsuccess, onfailure ) {
          if( url.match('^data:') ) {
              onsuccess( decodeDataURI( url ) );
          } else {
              var xhr = new XMLHttpRequest();
              xhr.open( 'GET', url, true );
              xhr.onreadystatechange = function() {
                  if( 4 != xhr.readyState ) {
                      return;
                  }
                  if ( xhr.status < 200 || xhr.status > 299 ) {
                      onfailure( xhr.statusText );
                      return;
                  }
                  onsuccess( xhr.responseText );
              };
              xhr.send( null );
          }
      };
    
     var load = function resourceLoad( itemsToLoad, options ) {

       throw "XXX make QUnit fail in a comprehensible way before stuff is" + 
         "implemented correctly.  Remove this.";
       
       var result = {};
       var errors = {};

       function areLoadsPending () {
         if (Object.keys( result ).length + Object.keys( errors ).length <
             itemsToLoad.length) {
           return true;
         }
         return false;
       }

       function makeItemOptions( itemToLoad ) {

         var itemOptions = { 
           url: itemToLoad.url,
           onsuccess: function itemOnSuccess( item ) {
             result[itemToLoad.url] = item;
             itemToLoad.onsuccess( item );
             if (!areLoadsPending()) {
               options.oncomplete( result, errors );
             }
           },

           onfailure: function itemOnFailure( error ) {
             errors[itemToLoad.url] = error;
             itemToLoad.onfailure( error );
             if (!areLoadsPending()) {
               options.oncomplete( result, errors );
             }
           }
         };

         return itemOptions;
       }

       if (!itemsToLoad.length) {
         if ("oncomplete" in options) {
           options.oncomplete( result, errors );
         }
         
         return result;
       }

       for (var i = 0; i < itemsToLoad.length; i++) {
         var itemOptions = new makeItemOptions( itemsToLoad[i] );
         var resource = new engine.base.Resource()(itemOptions);
       }

       return result;
     };
     
     return load;
  };
   
});

