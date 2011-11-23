/*jshint white: false, strict: false, plusplus: false, nomen: false */
/*global define: false, console: false, window: false */

define( function ( require ) {
    var lang = require( './core/lang' ),
        _Math = require( 'math/math-require' ),
        ThreadPool = require( './core/threading/pool' ),
        Scheduler = require( './core/scheduler' ),
        Event = require( './core/event' ),

    // Services
        Graphics = require( './graphics/service' ),
    
    // Core
        Scene = require( './core/scene' ),
        Component = require( './core/component' ),
        Entity = require( './core/entity' ),
        Transform = require( './core/component/transform' ),
        Script = require( './core/resource/script' ),

    Gladius, i, args,

    // Expose the API on the global object. Part of if may already
    // exist, mainly gladius.ready from gladius.js. Check tools/wrap.start
    // for protections against overwriting an existing gladius in the page,
    // for when gladius is built for deployment.
    global = window.gladius || ( window.gladius = {} );

    /***
     * Gladius
     *
     * This is where we put all of our goodies. Some are instances, like the services,
     * and others are prototypes to be used and extended.
     */
    Gladius = function ( options, callback ) {
        var sNames = [],
        sIds = [],
        services, prop;

        this.options = options || {};
        this.debug = this.options.debug ? console.log : function () {};

        // Init instance of each service and store reference as service name
        services = this.options.services || global.services;
        for ( prop in services ) {
            if ( services.hasOwnProperty( prop ) ) {
                sNames.push(prop);
                sIds.push('./' + services[prop]);
            }
        }
        

        var _math = new _Math();
        Object.defineProperty( this, 'math', {
            get: function() {
                return _math;
            }
        });

        var _scheduler = new Scheduler();
        Object.defineProperty( this, 'scheduler', {
            get: function() {
                return _scheduler;
            }
        });

        var _threadPool = new ThreadPool({
            size: 2
        });
        Object.defineProperty( this, 'threadPool', {
            get: function() {
                return _threadPool;
            }
        });

        // Fetch the services. These can potentially be async operations.
        // In a build, they are async, but do not result in any network
        // requests for the services bundled in the build.
        require(sIds, lang.bind(this, function () {

            // Expose engine objects, partially
            // applying items needed for their constructors.
            lang.extend(this, {
                Event: Event,
                core: {
                    Entity: Entity( this ),
                    Component: Component,
                    Resource: null,
                    Scene: Scene( this ),
                    component: {
                        Transform: Transform( this )
                    },
                    resource: {
                        Script: Script,
                    }
                },
            });
 
            // Create a property on the instance's service object for
            // each service, based on the name given the services options object.
            var subs = this.service = {},
            i;
            for (i = 0; i < arguments.length; i++) {
                var s = arguments[i]( this );
                subs[ sNames[i] ] = new s();
            }

            // Hmm, graphics is also on this, instead of always
            // referenced on service? sound too?
            this.graphics = subs.graphics;
            // this.physics = subs.physics;
            // this.sound = subs.sound;

           
            this.assert = function( condition, message ) {
                if( !condition )
                    throw 'Assertion failed: ' + message;
            }

            // Create music Speaker singleton
            // this.sound.music = new this.component.Speaker();

            // Create input handlers
            // this.keyboardInput = new KeyboardInput( this.messenger, window );
            if (subs.graphics && subs.graphics.getCanvas) {
                // this.mouseInput = new MouseInput( this.messenger, subs.graphics.getCanvas() );
                // this.touchInput = new TouchInput( this.messenger, subs.graphics.getCanvas() );
            }

            // run user-specified setup function
            if ( this.options.setup ) {
                this.options.setup( this );
            }

            // Let caller know the engine instance is ready.
            if (callback) {
                callback(this);
            }
        }));
    }; //Gladius

    // Set up common properties for all engine instances
    Gladius.prototype = {

            run: function () {
                if ( this.options.run ) {
                    this.options.run( this );
                }
                this.scheduler.run();
            }

    };

    // Export the public API for creating engine instances.
    global.create = function ( options, callback ) {
        return new Gladius( options, callback );
    };

    // Any default services that should be created if
    // caller to gladius.create() does not explicitly ask for
    // services in the options.
    global.services = {
            // physics: 'physics/default',
            // graphics: 'graphics/service',
            // sound: 'sound/default'
    };

    // Call any callbacks waiting for gladius to be available.
    if ( global._waitingCreates ) {
        for ( i = 0; (args = global._waitingCreates[i]); i++ ) {
            global.create.apply(global, args);
        }
        delete global._waitingCreates;
    }

    return global;
});
