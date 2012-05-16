document.addEventListener( "DOMContentLoaded", function( e ) {

  var canvas = document.getElementById( "test-canvas" );    

  require.config({
    baseUrl: "../../lib",
    paths: {
      "src": "../src",
      "base": "../src/base",
      "common": "../src/common",
      "core": "../src/core",
      "extensions": "../src/extensions",
    }
  });
  
  require( 
    [ "core/gladius", 
      "extensions/gladius-cubicvr" ], 
    function( Gladius, cubicvrExtension ) {

        var engine = new Gladius();
        engine.registerExtension( cubicvrExtension );
        
        game( engine );        

  });

  function game( engine ) {

  }

});
