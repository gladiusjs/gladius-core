var game = function( engine ) {
    // Create a new task to log the frame count
    var t = new engine.scheduler.Task({
        callback: function() {
            console.log( engine.scheduler.frame );
        }
    });

    // Start the engine!
    engine.run();
};

gladius.create( {debug: true}, game );
