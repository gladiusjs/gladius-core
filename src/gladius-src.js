/*jshint white: false, strict: false, plusplus: false, nomen: false */
/*global define: false, console: false, window: false */

define( function ( require ) {
    var lang = require( 'lang' ),
        _Math = require( 'math/math-require' ),
        ThreadPool = require( 'core/threading/pool' ),
        Scheduler = require( 'core/scheduler' ),
        Delegate = require( 'common/delegate' ),
        Timer = require( 'core/timer' ),
        Event = require( 'core/event' ),
        Queue = require( 'common/queue' ),

    // Services
        Service = require( 'base/service' ),
        // Graphics = require( './graphics/service' ),
        // ActionLists = require( './behavior/action-list/service' ),

        Resource = require( 'base/resource' ),
        Space = require( 'core/space' ),
        Component = require( 'base/component' ),
        Entity = require( 'core/entity' ),
        Transform = require( 'core/component/transform' ),
        Script = require( 'core/resource/script' ),
        Template = require( 'core/resource/template' ),
        get = require('core/resource/get'),
        defaultLoad = require( 'core/resource/loaders/default' ),
        proceduralLoad = require( 'core/resource/loaders/procedural' ),
        Collada = require('core/resource/collada'),
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
        sOptions = [],
        sIds = [],
        services, prop;

        this.options = options || {};
        this.debug = this.options.debug ? console.log : function () {};

        // Init instance of each service and store reference as service name
        services = this.options.services || global.services;
        for ( prop in services ) {
            if ( services.hasOwnProperty( prop ) ) {
                if ( typeof services[ prop ] === "string" ) {
                    sNames.push( prop );
                    sIds.push( './' + services[ prop ] );
                    sOptions.push( {} );
                }
                else {
                    sNames.push( prop );
                    sIds.push( './' + services[ prop ].src );
                    sOptions.push( services[ prop ].options || {} );
                }
            }
        }
        
        var _guid = lang.guid;
        Object.defineProperty( this, 'guid', {
            get: function() {
                return _guid;
            }
        });
        
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
        var _time = {
            real: new _scheduler.Timer(),
            simulation: new _scheduler.Timer()
        };

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
            lang.extend( this, {
                common: {
                    Queue: Queue,
                    Delegate: Delegate
                },
                base: {
                    Service: Service( this ),
                    Resource: Resource,
                    Component: Component
                }                
            });
            
            lang.extend( this, {
                core: {
                    Entity: Entity( this ),
                    Space: Space( this ),
                    Event: Event,
                    component: {
                        Transform: Transform( this )
                    },
                    resource: {
                        Script: Script( this ),
                        Template: Template( this ),
                        get: get,
                        defaultLoad: defaultLoad,
                        proceduralLoad: proceduralLoad( this ),
                        Collada: Collada( this )
                    }
                }
            });
            
            // Create a property on the instance's service object for
            // each service, based on the name given the services options object.
            var subs = this.service = {},
              i;
            for (i = 0; i < arguments.length; i++) {
                var s = arguments[ i ]( this ); 
                subs[ sNames[ i ] ] = new s( sOptions[ i ] );
            }
            lang.extend( this, subs );
            
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
                this.scheduler.resume();                
            },
    
            terminate: function() {
                this.scheduler.suspend();
                this.scheduler.clear();
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
