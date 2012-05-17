document.addEventListener( "DOMContentLoaded", function( e ) {

  require.config({
    baseUrl: "../../lib",
    paths: {
      "src": "../src",
      "base": "../src/base",
      "common": "../src/common",
      "core": "../src/core",
      "extensions": "../src/extensions"
    }
  });
  
  require( 
    [ "core/gladius", 
      "extensions/gladius-cubicvr" ], 
    function( Gladius, cubicvrExtension ) {

      var engine = new Gladius();

      function monitor( engine ) {
        console.log( engine.frame );
      }
      engine.attach( monitor );

      var cubicvrOptions = {
        renderer: {
          canvas: document.getElementById( "test-canvas" )
        }
      };
      engine.registerExtension( cubicvrExtension, cubicvrOptions );

      var resources = {};

      engine.get(
        [
          {
            type: engine["gladius-cubicvr"].Mesh,
            url: 'procedural-mesh.js',
            load: engine.loaders.proceduralLoad,
            onsuccess: function( mesh ) {
              resources.mesh = mesh;
            },
            onfailure: function( error ) {
            }
          },
          {
            type: engine["gladius-cubicvr"].MaterialDefinition,
            url: 'procedural-material.js',
            load: engine.loaders.proceduralLoad,
            onsuccess: function( material ) {
              resources.material = material;
            },
            onfailure: function( error ) {
            }
          }
        ],
        {
          oncomplete: game.bind( null, engine, resources )
        }
      );

  });

  function game( engine, resources ) {
    var space = new engine.simulation.Space();
    var cubicvr = engine.findExtension( "gladius-cubicvr" );
    space.add( new engine.simulation.Entity( "camera",
      [
        new engine.core.Transform( [0, 0, -2] ),
        new cubicvr.Camera()
      ]
    ));
    space.add( new engine.simulation.Entity( "cube",
      [
        new engine.core.Transform(),
        new cubicvr.Model( resources.mesh, resources.material )
      ]
    ));

    engine.resume();
  }

});
