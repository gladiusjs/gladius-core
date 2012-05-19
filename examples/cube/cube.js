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
    [ "core/gladius-core", 
      "gladius-cubicvr" ],
    function( Gladius, cubicvrExtension ) {

      var engine = new Gladius();

      // Engine monitor setup
      function monitor( engine ) {
        debugger;
        engine.detach( monitor );
      }
      document.addEventListener( "keydown", function( event ) {
        var code = event.which || event.keyCode;
        if( code === 0x4D && event.ctrlKey && event.altKey ) {
          engine.attach( monitor );
        }
      });

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
        new engine.core.Transform( [0, 0, 0] ),
        new cubicvr.Camera()
      ]
    ));
    space.add( new engine.simulation.Entity( "light-center",
      [
        new engine.core.Transform( [0, 0, 5], [engine.math.TAU, engine.math.TAU, engine.math.TAU] )
      ]
    ));
    space.add( new engine.simulation.Entity( "light-marker",
      [
        new engine.core.Transform( [3, 0, 0], [0, 0, 0], [0.1, 0.1, 0.1] ),
        new cubicvr.Model( resources.mesh, resources.material )
      ]
    ));
    space.add( new engine.simulation.Entity( "light-source",
      [
        new engine.core.Transform( [3, 0, 0], [0, 0, 0], [1, 1, 1] ),
        new cubicvr.Light( lightDefinition )
      ]
    ));
    var parentCube = new engine.simulation.Entity( "cube",
      [
        new engine.core.Transform( [0, 0, 6], [0, -engine.math.TAU/8, engine.math.TAU/8] ),
        new cubicvr.Model( resources.mesh, resources.material )
      ]
    );
    space.add( parentCube );
    space.findNamed( "light-source" ).setParent( space.findNamed( "light-center" ) );
    space.findNamed( "light-marker" ).setParent( space.findNamed( "light-center" ) );

    var task = new engine.FunctionTask( function() {
      var cubeRotation = new engine.math.Vector3( space.findNamed( "cube" ).findComponent( "Transform" ).rotation );
      cubeRotation = engine.math.vector3.add( cubeRotation, [space.clock.delta * 0.003, space.clock.delta * 0.001, space.clock.delta * 0.0007] );
      space.findNamed( "cube" ).findComponent( "Transform" ).setRotation( cubeRotation );

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
