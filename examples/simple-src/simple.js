document.addEventListener( "DOMContentLoaded", function( e ){

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

    console.log( "engine loaded" );

    engine.registerExtension( cubicvrExtension );
  });
  
});
