document.addEventListener( "DOMContentLoaded", function( e ){

    var canvas = document.getElementById( "test-canvas" );
    var entities = 0;
    var objects = [];
    
    var game = function( engine ) {
    	
        // Make a new space for our entities
        var space = new engine.core.Space();
        var math = engine.math;
        
        var CubicVR = engine.graphics.target.context;
        CubicVR.setGlobalAmbient([1,1,1]);
        
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
                    	rotation: instance._cvr.mesh.lrotation, 
                        position: instance._cvr.mesh.position, 
                        scale: instance._cvr.mesh.scale 
                    }),
                    new engine.graphics.component.Model({
                        mesh: instance,
                    })
                ]
            });
            
            objects.push( entity );
            
            // TODO: Fix me.
            entities++;
            if(entities == 200){
                run();
            }
        };
              
        
        var run = function() {

            canvas = engine.graphics.target.element;
            
            var camera = new space.Entity({
                name: 'camera',
                components: [
                    new engine.core.component.Transform({
                        position: math.Vector3( 0, 150, -50 )
                    }),
                    new engine.graphics.component.Camera({
                        active: true,
                        width: canvas.width,
                        height: canvas.height,
                        fov: 60
                    })
                ]
            });
            
            camera.find( 'Camera' ).target = math.Vector3( 0, 0, 0 );
            
            var task = new engine.scheduler.Task({
                schedule: {
                    phase: engine.scheduler.phases.UPDATE,
                },
                callback: function() {
                }
            });
            
            engine.run();
        };

        //
        engine.core.resource.Collada({
        	url: "city/intro_city-anim.dae",
        	onsuccess: function( instance ) {
        		registerColladaResource( 'test', instance );
            }
        });   
    };


    gladius.create(
            {
                debug: true,
                services: {
                    graphics: {
                        src: 'graphics/service',
                        options: {
                            canvas: canvas
                        }
                    }
                }
            },
            game
    );

});
