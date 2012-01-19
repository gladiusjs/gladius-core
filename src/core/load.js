/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false */

define( function ( require ) {

  return function ( engine ) {
    
     var load = function resourceLoad( itemsToLoad, options ) {

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

