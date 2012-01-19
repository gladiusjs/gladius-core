document.addEventListener( "DOMContentLoaded", function( e ){

    var printd = function( div, str ) {
        div = div || 'out';
        document.getElementById( div ).innerHTML += str;
    };

    var game = function( engine ) {
        var math = engine.math;

        var HealthComponent = engine.core.Component({
            type: 'Health'
        },
        function( options ) {

            options = options || {};
            var that = this;

            var _hits = options.hits || 10;
            Object.defineProperty( this, 'hits', {
                get: function() {
                    return _hits;
                },
                set: function( value ) {
                    _hits = value;
                    if( 0 === _hits ) {
                        new engine.core.Event({
                            type: 'ZERO_HEALTH'
                        }).send( that.owner );
                    };
                }
            });

            var _maxHits = _hits;
            Object.defineProperty( this, 'maxHits', {
                get: function() {
                    return _maxHits;
                }
            });

            var handleDamage = function( event ) {
                that.hits = Math.max( _hits - event.hits, 0 );
                console.log( that.owner.name + ' (id:' + that.owner.id + ') takes ' + event.hits + ' damage; ' + _hits + '/' + _maxHits + ' remaining' );
            };

            var handleOwnerChanged = function( options ) {    		
                if( options.previous ) {
                    options.previous.unregisterHandler( 'DAMAGE', handleDamage );
                }
                if( options.current ) {
                    options.current.registerHandler( 'DAMAGE', handleDamage );
                }
            };
            this.ownerChanged.subscribe( handleOwnerChanged );

        });

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
        cubes[0].add( new HealthComponent() );

        cubes.push( new space.Entity({
            name: 'cube1'
        }) );
        cubes[1].add( new engine.core.component.Transform({
            position: math.Vector3( 1, 1, 1 )
        }) );
        cubes[1].add( new HealthComponent({
            hits: 20
        }) );

        cubes[1].parent = cubes[0];

        // Send a damage event to the cubes
        new engine.core.Event( 'DAMAGE', {
            hits: 7
        }).send( cubes );

        // Start the engine!
        engine.run();
    };

    gladius.create(
            {
                debug: true,
                services: {
                }
            },
            game
    );

});
