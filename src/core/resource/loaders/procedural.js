/*jshint white: false, strict: false, plusplus: false, onevar: false,
 nomen: false */
/*global define: false, console: false */

define(function(require) {

  var lang = require('lang');
  var Script = require('core/resource/script');
  var get = require('core/resource/get');

  return function(url, onsuccess, onfailure) {

    var scriptLocation = url.split( "?" )[0];
    var scriptOptions = lang.getURLParams(url);

    get([{
      url : 'assets/test-script.js',
      type : Script,
      onsuccess : function(instance) {
        try { 
          var data = instance.run( scriptOptions );
          onsuccess( data ) ;
        } catch ( e ) {
          onfailure( e );
        } 
      },
      onfailure : onfailure
    }]);

  };
});
