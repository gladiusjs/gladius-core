document.addEventListener( "DOMContentLoaded", function( e ){

  require.config({
    baseUrl: "../../wip-src",
    paths: {
      "lib": "../lib"
    }
  });
  
  require( ["core/gladius"], function( Gladius ) {
    var engine = new Gladius();
    console.log( "engine loaded" );
  });
  
});
