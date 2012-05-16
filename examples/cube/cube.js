document.addEventListener( "DOMContentLoaded", function( e ) {

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
      
      var cubicvrOptions = {
        renderer: {
          canvas: document.getElementById( "test-canvas" )
        }
      };
      engine.registerExtension( cubicvrExtension, cubicvrOptions );

      game( engine );

  });

  function game( engine ) {

    var space = new engine.simulation.Space();
    space.add( new engine.simulation.Entity( "cube",
      [
        new engine.core.Transform()
      ]
    ));
    var entity = space.findNamed( "cube" );

    debugger;

  }

});
