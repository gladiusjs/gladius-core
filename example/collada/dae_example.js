/*global console, gladius, window */

document.addEventListener("DOMContentLoaded", function(e) {

  var canvas = document.getElementById("test-canvas");
  var entities = 0;
  var objects = [];
  var resources = {};

  var game = function(engine) {

    // Make a new space for our entities
    var space;// = new engine.core.Space();
    var math = engine.math;

    var CubicVR = engine.graphics.target.context;
    CubicVR.setGlobalAmbient([1, 1, 1]);

    function colladaLoader(url, onsuccess, onfailure) {
      // XXX figure out why this is necessary
      window.CubicVR = engine.graphics.target.context;

      try {
        var context = engine.graphics.target.context;
        var scene = context.loadCollada(url, url.split("/")[0]);
        onsuccess(scene);
      } catch ( e ) {
        onfailure(e);
      }
    }

    /*
     // TODO: Fix me.
     // instance = Collada object
     var registerColladaResource = function( n, instance ) {

     if(instance._cvr.mesh){
     if(!instance._cvr.mesh.obj){
     return;
     }
     }

     var entity = new space.Entity({
     name: n,
     components: [
     new engine.core.component.Transform({
     rotation: instance._cvr.mesh.rotation,
     position: instance._cvr.mesh.position,
     scale: instance._cvr.mesh.scale
     }),
     new engine.graphics.component.Model({
     mesh: instance
     })
     ]
     });

     objects.push( entity );

     // TODO: Fix me.
     //dont' touch this.
     entities++;
     if(entities == 200){
     run();
     }
     };
     */

    var run = function() {
      canvas = engine.graphics.target.element;

      var myCube = new space.Entity({
        name : 'cube0',
        components : [new engine.core.component.Transform({
          position : math.Vector3(0, 0, 0),
          rotation : math.Vector3(0, 0, 0)
        }), new engine.graphics.component.Model({
          mesh : resources.mesh,
          material : resources.material
        })]
      });

      var camera = new space.Entity({
        name : 'camera',
        components : [new engine.core.component.Transform({
          position : math.Vector3(0, 50, -50)
        }), new engine.graphics.component.Camera({
          active : true,
          width : canvas.width,
          height : canvas.height,
          fov : 60
        })]
      });

      camera.find('Camera').target = math.Vector3(0, 0, 0);

      var task = new engine.scheduler.Task({
        schedule : {
          phase : engine.scheduler.phases.UPDATE
        },
        callback : function() {
        }
      });

      engine.run();
    };

    engine.core.resource.get([

    {
      type : engine.core.resource.Collada,
      url : "city/intro_city-anim.dae",
      load : colladaLoader,
      onsuccess : function(instance) {
        space = instance.value;
      },
      onfailure : function(error) {
        console.log("error loading collada resource: " + error);
      }
    },

     {
      type : engine.graphics.resource.Mesh,
      url : '../cube/procedural-mesh.js',
      load : engine.core.resource.proceduralLoad,
      onsuccess : function(mesh) {
        resources.mesh = mesh;
      },
      onfailure : function(error) {
        console.log("error loading procedural mesh: " + error);
      }
    }, {
      type : engine.graphics.resource.Material,
      url : '../cube/procedural-material.js',
      load : engine.core.resource.proceduralLoad,
      onsuccess : function(material) {
        resources.material = material;
      },
      onfailure : function(error) {
        console.log("error loading procedural material: " + error);
      }
    }], {
      oncomplete : function() {
        run();
      }
    });

  };

  gladius.create({
    debug : true,
    services : {
      graphics : {
        src : 'graphics/service',
        options : {
          canvas : canvas
        }
      }
    }
  }, game);

});
