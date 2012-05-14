document.addEventListener( "DOMContentLoaded", function( e ){

  require.config({
    baseUrl: "../../src",
    paths: {
      "core-lib": "../lib"
    }
  });
  
  require( ["core/gladius", "extensions/cubicvr/src/gladius-cubicvr"], function( Gladius ) {
    var engine = new Gladius();
    console.log( "engine loaded" );
  });
  
});
