var printd = function( div, str ) {
    document.getElementById( div ).innerHTML += str;
};

var game = function( engine ) {
    var math = engine.math;
    var resources = {}; 

    var game = function() {

        // Make a new space for our entities
        var space = new engine.core.Space();

        // Make some entities and arrange them
        var cubes = [];

        cubes.push( new space.Entity({
            name: 'cube0',
            components: [
new engine.core.component.Transform({
    position: math.Vector3( 0, 0, 0 )
}),
new engine.graphics.component.Model({
    mesh: resources.mesh
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
    mesh: resources.mesh
})
]
        }) );

        var camera = new space.Entity({
            name: 'camera',
            components: [
new engine.core.component.Transform({
    position: math.Vector3( 0, 0, 0 )
}),
new engine.graphics.component.Camera({
    active: true,
    fov: 60
})
]
        });

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
                behavior: 'logic/action-list/service',
                graphics: 'graphics/service'
            }
        },
        game
);
