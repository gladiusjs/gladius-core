document.addEventListener( "DOMContentLoaded", function( e ){

    var printd = function( div, str ) {
        document.getElementById( div ).innerHTML = str + '<p>';
    };
    var cleard = function( div ) {
        document.getElementById( div ).innerHTML = '';
    };

    var canvas = document.getElementById( "test-canvas" );    
    var resources = {};

    var game = function( engine ) {
        
        var math = engine.math;

        var CubicVR = engine.graphics.target.context;
       
        var run = function() {

            canvas = engine.graphics.target.element;
            
            // Make a new space for our entities
            var space = new engine.core.Space();
            
            var entity = space.Entity({
                name: 'test',
                components:[
                    new engine.input.component.Controller()
                ]
            });
            
            // Start the engine!
            engine.run();

        };

        run();

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
                    },
                    input: 'input/service'
                }
            },
            game
    );

});
