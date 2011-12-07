var printd = function( div, str ) {
	document.getElementById( div ).innerHTML += str;
};

var game = function( engine ) {
    var math = engine.math;
    
    // Make a new space for our entities
    var space = new engine.core.Space();
    
    // Make some entities and arrange them
    var cubes = [];

    cubes.push( new space.Entity({
        name: 'cube0'
    }) );
    cubes[0].add( new engine.core.component.Transform({
        position: math.Vector3( 1, 2, 3 )
    }) );

    cubes.push( new space.Entity({
        name: 'cube1'
    }) );
    cubes[1].add( new engine.core.component.Transform({
        position: math.Vector3( 1, 1, 1 )
    }) );

    cubes[1].parent = cubes[0];
    
    // Start the engine!
    engine.run();
};

gladius.create( {debug: true}, game );
