define(function(require) {

  var get = require('core/get');
  var Script = require('core/resources/script');
  var getURLParams = require('common/get-URL-Params');
  return function(url, onsuccess, onfailure) {

    var scriptLocation = url.split( "?" )[0];
    var scriptOptions = getURLParams(url);
    get([{
      url : scriptLocation,
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
