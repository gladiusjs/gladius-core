/*jshint white: false, strict: false, plusplus: false, nomen: false */
/*global define: false, console: false, window: false */

define( function ( require ) {
  var lang = require( './core/lang' ),
      Tasker = require( './core/Tasker' ),
      Loader = require( './core/Loader' ),
      KeyboardInput = require( './input/KeyboardInput' ),
      MouseInput = require( './input/MouseInput' ),
      TouchInput = require( './input/TouchInput' ),
      InputMap = require( './input/InputMap' ),
      Messenger = require( './core/Messenger' ),
      Scene = require( './core/Scene' ),
      Entity = require( './core/Entity' ),
      SpatialComponent = require( './core/SpatialComponent' ),
      CameraComponent = require( './core/CameraComponent' ),
      ModelComponent = require( './core/ModelComponent' ),
      SpeakerComponent = require( './core/SpeakerComponent' ),

      Paladin, i, args,

      // Expose the API on the global object. Part of if may already
      // exist, mainly paladin.ready from paladin.js. Check tools/wrap.start
      // for protections against overwriting an existing paladin in the page,
      // for when paladin is built for deployment.
      global = window.paladin || ( window.paladin = {} );

  // Utility to bridge the gap between constructor functions
  // that need to know the paladin instance.
  function partialCtor( Func, instance ) {
    return function ( options ) {
      return new Func( instance, options );
    };
  }

  /***
  * Paladin
  *
  * This is where we put all of our goodies. Some are instances, like the subsystems,
  * and others are prototypes to be used and extended.
  */
  Paladin = function ( options, callback ) {
    var sNames = [],
        sIds = [],
        subsystems, prop;

    this.options = options || {};
    this.debug = this.options.debug ? console.log : function () {};
    this.tasker = new Tasker();
    this.messenger = new Messenger( this.tasker );
    this.loader = new Loader();

    // Init instance of each subsystem and store reference as subsystem name
    subsystems = this.options.subsystems || global.subsystems;
    for ( prop in subsystems ) {
      if ( subsystems.hasOwnProperty( prop ) ) {
        sNames.push(prop);
        sIds.push('./' + subsystems[prop]);
      }
    }

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
      this.graphics = subs.graphics;
      this.physics = subs.physics;
      this.sound = subs.sound;

      // Expose Paladin objects, partially
      // applying items needed for their constructors.
      lang.extend(this, {
        Entity: partialCtor( Entity, this ),
        Scene: partialCtor( Scene, this ),
        InputMap: partialCtor( InputMap, this ),

        // Expose components,
        // but partially apply the subsytem object
        // for this instance to each constructor.
        component: {
          Spatial: partialCtor( SpatialComponent, this ),
          Camera: partialCtor( CameraComponent, this ),
          Model: partialCtor( ModelComponent, this ),
          Speaker: partialCtor( SpeakerComponent, this ),
          Light: null
        }
      });

      // Create music Speaker singleton
      this.sound.music = new this.component.Speaker();

      // Create input handlers
      this.keyboardInput = new KeyboardInput( this.messenger, window );
      if (subs.graphics.getCanvas) {
        this.mouseInput = new MouseInput( this.messenger, subs.graphics.getCanvas() );
        this.touchInput = new TouchInput( this.messenger, subs.graphics.getCanvas() );
      }

      // run user-specified setup function
      if ( this.options.setup ) {
          this.options.setup( this );
      }

      // Let caller know the Paladin instance is ready.
      if (callback) {
        callback(this);
      }
    }));
  }; //Paladin

  // Set up common properties for all Paladin instances
  Paladin.prototype = {

    run: function () {
        if ( this.options.run ) {
            this.options.run( this );
        }
        this.tasker.run();
    }
  };

  // Export the public API for creating Paladin instances.
  global.create = function ( options, callback ) {
    return new Paladin( options, callback );
  };

  // Any default subsystems that should be created if
  // caller to paladin.create() does not explicitly ask for
  // subsystems in the options.
  global.subsystems = {
    dummy: 'dummy',
    physics: 'physics/default',
    graphics: 'graphics/cubicvr',
    sound: 'sound/default'
  };

  // Call any callbacks waiting for paladin to be available.
  if ( global._waitingCreates ) {
    for ( i = 0; (args = global._waitingCreates[i]); i++ ) {
      global.create.apply(global, args);
    }
    delete global._waitingCreates;
  }

  return global;
});
