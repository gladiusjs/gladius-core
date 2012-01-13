/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false */

define( function ( require ) {

  return function ( engine ) {
    
     var load = function resourceLoad( itemsToLoad, options ) {

       var result = {};
       var failedLoads = [];

       function areLoadsPending () {
         if (Object.keys( result ).length + failedLoads.length <
             itemsToLoad.length) {
           return true;
         }
         return false;
       }

       function makeItemOptions( itemToLoad ) {

         var itemOptions = { 
           source: itemToLoad.source,
           onsuccess: function itemOnSuccess( item ) {
             result[itemToLoad.source] = item;
             itemToLoad.onsuccess( item );
             if (!areLoadsPending()) {
               options.oncomplete( result );
             }
           },

           onfailure: function itemOnFailure( error ) {
             console.log("onfailure called");
             failedLoads.push(itemToLoad.source);
             itemToLoad.onfailure( error );
             if (!areLoadsPending()) {
               options.oncomplete( result );
             }
           }
         };

         return itemOptions;
       }

       if (!itemsToLoad.length) {
         if ("oncomplete" in options) {
           options.oncomplete( result );
         }
         
         return result;
       }

       for (var i = 0; i < itemsToLoad.length; i++) {

         var itemOptions = new makeItemOptions( itemsToLoad[i] );
         var resource = new engine.base.Resource()(itemOptions);
         
         return result;
       }
     };
     
     return load;
  };
   
});

