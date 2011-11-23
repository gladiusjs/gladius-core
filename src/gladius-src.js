/*jshint white: false, strict: false, plusplus: false, nomen: false */
/*global define: false, console: false, window: false */

define( function ( require ) {
    var lang = require( './core/lang' ),
        _Math = require( 'math/math-require' ),

        Configurator = require( './core/Configurator' ),
        Entity = require( './core/Entity' ),
        Component = require( './core/Component' ),
        Scene = require( './core/Scene' ),
        Transform = require( './core/component/Transform' ),
        Scheduler = require( './core/Scheduler' ),
        Text = require( './core/resource/Text' ),

    Gladius, i, args,

    // Expose the API on the global object. Part of if may already
    // exist, mainly gladius.ready from gladius.js. Check tools/wrap.start
    // for protections against overwriting an existing gladius in the page,
    // for when gladius is built for deployment.
    global = window.gladius || ( window.gladius = {} );

    /***
     * Gladius
     *
     * This is where we put all of our goodies. Some are instances, like the subsystems,
     * and others are prototypes to be used and extended.
     */
    Gladius = function ( options, callback ) {
        var that = this,
        sNames = [],
        sIds = [],
        subsystems, prop;

        this.options = options || {};
        this.debug = this.options.debug ? console.log : function () {};

        // Init instance of each subsystem and store reference as subsystem name
        subsystems = this.options.subsystems || global.subsystems;
        for ( prop in subsystems ) {
            if ( subsystems.hasOwnProperty( prop ) ) {
                sNames.push(prop);
                sIds.push('./' + subsystems[prop]);
            }
        }
        

        var _math = new _Math();
        Object.defineProperty( this, 'math', {
            get: function() {
                return _math;
            }
        });

        var _nextGUID = 0;
        Object.defineProperty( this, 'nextGUID', {
            get: function() {
                if( this.options.debug ) {
                    var nextGUID = ++ _nextGUID;
                    if( _nextGUID < nextGUID )
                        this.debug( 'GUID overflow' );
                    return nextGUID;
                }
                else {
                    return ++ _nextGUID;
                }
            }
        });


        var _scheduler = new Scheduler();
        Object.defineProperty( this, 'scheduler', {
            get: function() {
                return _scheduler;
            }
        });

        // Fetch the subsystems. These can potentially be async operations.
        // In a build, they are async, but do not result in any network
        // requests for the subsystems bundled in the build.
        require(sIds, lang.bind(this, function () {
            // Create a property on the instance's subsystem object for
            // each subsystem, based on the name given the subsystems options object.
            var subs = this.subsystem = {},
            i;
            for (i = 0; i < arguments.length; i++) {
                subs[ sNames[i] ] = new arguments[i]( this.options );
            }

            // Hmm, graphics is also on this, instead of always
            // referenced on subsystem? sound too?
            // this.graphics = subs.graphics;
            // this.physics = subs.physics;
            // this.sound = subs.sound;

            // Expose engine objects, partially
            // applying items needed for their constructors.
            lang.extend(this, {
                core: {
                    Configurator: Configurator( this ),
                    Entity: Entity( this ),
                    Component: Component,
                    Resource: null,
                    Scene: Scene( this ),
                    component: {
                        Transform: Transform( this )
                    },
                    resource: {
                        Text: Text( this )
                    }
                },
                graphics: {
                    component: {},
                    resource: {}
                },
                physics: {
                    component: {},
                    resource: {}
                },
                sound: {
                    component: {},
                    resource: {}
                }
            });
            
            var _configurator = new this.core.Configurator( {
                defaultConfiguration: require( './config/default' )
            });
            Object.defineProperty( this, 'configurator', {
                get: function() {
                    return _configurator;
                }
            });
            
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

            // Load any persistent configuration then let caller know the engine instance is ready.
            this.configurator.load( function() {
                if ( callback ) {
                    callback( that );
                }
            });
        }));
    }; //Paladin

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

    // Any default subsystems that should be created if
    // caller to gladius.create() does not explicitly ask for
    // subsystems in the options.
    global.subsystems = {
            // physics: 'physics/default',
            // graphics: 'graphics/cubicvr',
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
