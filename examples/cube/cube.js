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
      // engine.attach( monitor );

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
            load: engine.loaders.procedural,
            onsuccess: function( mesh ) {
              resources.mesh = mesh;
            },
            onfailure: function( error ) {
            }
          },
          {
            type: engine["gladius-cubicvr"].MaterialDefinition,
            url: 'procedural-material.js',
            load: engine.loaders.procedural,
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

    var lightDefinition = new cubicvr.LightDefinition({
      intensity: 2,
      light_type: cubicvr.LightDefinition.LightTypes.POINT,
      method: cubicvr.LightDefinition.LightingMethods.DYNAMIC
    })

    space.add( new engine.simulation.Entity( "camera",
      [
        new engine.core.Transform( [0, engine.math.TAU/5, 0] ),
        new cubicvr.Camera()
      ]
    ));
    space.add( new engine.simulation.Entity( "light-center",
      [
        new engine.core.Transform( [0, 0, 5] )
      ]
    ));
    space.add( new engine.simulation.Entity( "light-source",
      [
        new engine.core.Transform( [2, 0, 0], [0, 0, 0] ),
        new cubicvr.Light( lightDefinition )
      ]
    ));
    space.add( new engine.simulation.Entity( "cube",
      [
        new engine.core.Transform( [0, 0, 5], [0, 0, 0] ),
        new cubicvr.Model( resources.mesh, resources.material )
      ]
    ));
    space.findNamed( "light-source" ).setParent( space.findNamed( "light-center" ) );

    var task = new engine.FunctionTask( function() {
      var lightRotation = new engine.math.Vector3( space.findNamed( "light-center" ).findComponent( "Transform" ).rotation );
      lightRotation = engine.math.vector3.add( lightRotation, [0, space.clock.delta * 0.001, 0] );
      space.findNamed( "light-center" ).findComponent( "Transform" ).setRotation( lightRotation );
    }, {
      tags: ["@update"]
    });
    task.start();

    engine.resume();
  }

});
