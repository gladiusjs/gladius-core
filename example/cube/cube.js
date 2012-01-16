document.addEventListener( "DOMContentLoaded", function( e ){

    var printd = function( div, str ) {
        document.getElementById( div ).innerHTML += str;
    };

    var canvas = document.getElementById( "test-canvas" );    
    var resources = {};

    var game = function( engine ) {
        var math = engine.math;

        var game = function() {

            // Make a new space for our entities
            var space = new engine.core.Space();

            // Make some entities and arrange them
            var cubes = [];

            canvas = engine.graphics.target.element;

            cubes.push( new space.Entity({
                name: 'cube0',
                components: [
new engine.core.component.Transform({
    position: math.Vector3( 0, 0, 0 ),
    rotation: math.Vector3( 1, 2, 3 )
}),
new engine.graphics.component.Model({
    mesh: resources.mesh,
    material: resources.material
})
]
            }) );

            cubes.push( new space.Entity({
                name: 'cube1',
                components: [
new engine.core.component.Transform({
    position: math.Vector3( 1, 1, 1 ),
    scale: math.Vector3( 0.1, 0.1, 0.1 )
}),
new engine.graphics.component.Model({
    mesh: resources.mesh,
    // material: resources.material
})
]
            }) ); 

            var camera = new space.Entity({
                name: 'camera',
                components: [
new engine.core.component.Transform({
    position: math.Vector3( -100, 0, 0 )
}),
new engine.graphics.component.Camera({
    active: true,
    width: canvas.width,
    height: canvas.height,
    fov: 60
})
]
            });
            camera.find( 'Camera' ).target = cubes[0].find( 'Transform' ).position;

            cubes[1].parent = cubes[0];

            // Start the engine!
            engine.run();

        };

        var expectedResources = 2;
        var registerResource = function( name, instance ) {
            resources[name] = instance;
            if( Object.keys( resources ).length === expectedResources ) {
                game();
            }
        };

        engine.graphics.resource.Mesh({
            script: engine.graphics.script.mesh.cube,
            onsuccess: function( instance ) {
                registerResource( 'mesh', instance );
            }
        });
        engine.graphics.resource.Material({
            script: engine.graphics.script.material.sample,
            onsuccess: function( instance ) {
                registerResource( 'material', instance );
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