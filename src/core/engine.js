if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function ( require ) {
  
  var _Math = require( "_math" );
  
  var MulticastDelegate = require( "common/multicast-delegate" );
  var Loop = require( "core/request-animation-frame-loop" );
  var Clock = require( "core/clock" );
  var Scheduler = require( "core/dependency-scheduler" );
  var FunctionTask = require( "core/function-task" );
  var Timer = require( "core/timer" );
  var Event = require( "core/event" );
  var get = require( "core/get" );
  var loaders = {
      text: require( "core/loaders/default" ),
      procedural: require( "core/loaders/procedural" )
  };

  var base = {
    Component: require( "base/component" ),
    Service: require( "base/service" ),
    Extension: require( "base/extension" )
  };

  var Space = require( "core/space" );
  var Entity = require( "core/entity" );

  var core = new base.Extension( "core", {
    components: {
      "Transform": require( "core/components/transform" )
    },
    resources: {
      "Script": require( "core/resources/script" )
    }    
  });

  var logic = new base.Extension( "logic", {
    services: {
      "updater": {
        service: require( "core/services/updater" ),
        components: {
          "Actor": require( "core/components/actor" )
        },
        resources: {}
      }
    },
    resources: {
      "EventMap": require( "core/resources/event-map" )
    }
  });
  
  function simulationLoop() {
    // Increment frame counter
    this.frame += 1;
    
    // Update internal timestamp
    var timestamp = Date.now();
    this.cachedTimestamp = this.cachedTimestamp || timestamp; // This is a hack for the first frame
    var delta = timestamp - this.cachedTimestamp;
    this.cachedTimestamp = timestamp;
    
    // Update system clock
    this.realClock.update( delta );
    
    // Update scheduler and run all tasks
    this._scheduler.update();
    while( this._scheduler.hasNext() ) {
      this._scheduler.next().run();
    }
    
    // Run monitor callbacks
    if( this._monitor.size > 0 ) {
      this._monitor( this );
    }
  }
  
  var Engine = function() {
    this._loop = new Loop( simulationLoop, this );
    this.frame = 0;
    this._monitor = new MulticastDelegate();

    // System clocks
    this.realClock = new Clock();
    // The simulation clock receives update signals from the realtime clock
    this.simulationClock = new Clock( this.realClock.signal );
    
    this._scheduler = new Scheduler();
    
    // Bind the scheduler to the task constructor
    this.FunctionTask = FunctionTask.bind( this, this._scheduler );
 
    this.Timer = Timer;
    this.Event = Event;

    // Convenient constructors bound to each of the engine timers by default
    this.RealTimer = Timer.bind( this, this.realClock.signal );
    this.SimulationTimer = Timer.bind( this, this.simulationClock.signal );
    
    // Base prototypes, useful for extending the engine at runtime
    this.base = base;

    this.Space = Space;
    this.RealSpace = Space.bind( null, this.realClock );
    this.SimulationSpace = Space.bind( null, this.simulationClock );
    this.Entity = Entity;
  
    // Registered extensions go in here; They are also exposed as properties
    // on the engine instance
    this._extensions = {};

    // Register core extension
    this.registerExtension( core );

    // Register logic extension
    this.registerExtension( logic );
  };
  
  function suspend() {
    this._loop.suspend();
    
    return this;
  }
  
  function resume() {
    this._loop.resume();
    
    return this;
  }
  
  function attach( callback ) {
    this._monitor.subscribe( callback );
    
    return this;
  }
  
  function detach( callback ) {
    this._monitor.unsubscribe( callback );
    
    return this;
  }
  
  function isRunning() {
    return this._loop.isStarted();
  }
  
  function registerExtension( extension, options ) {
    if( !extension instanceof base.Extension ) {
      throw new Error( "argument is not an extension" );
    }

    options = options || {};

    var i, l;
    var j, m;
    var extensionInstance = {};
    
    var services = extension.services;
    var serviceNames = Object.keys( services );
    var serviceName, serviceOptions, service;
    var components, componentNames, componentName, ComponentConstructor;
    var resources, resourceNames, resourceName, ResourceConstructor;
    for( i = 0, l = serviceNames.length; i < l; ++ i ) {
      serviceName = serviceNames[i];
      serviceOptions = options[serviceName] || {};
      if( typeof services[serviceName] === "function" ) {
        extensionInstance[serviceName] = new services[serviceName]( 
            this._scheduler, serviceOptions );
      } else if( typeof services[serviceName] === "object" ) {
        service = new services[serviceName].service( this._scheduler, 
          serviceOptions );
        extensionInstance[serviceName] = service;

        components = services[serviceName].components;
        componentNames = Object.keys( components );
        for( j = 0, m = componentNames.length; j < m; ++ j ) {
          componentName = componentNames[j];
          ComponentConstructor = components[componentName].bind( null, service );
          var componentProperties = Object.keys(components[componentName]);
          for (i = 0, l = componentProperties.length; i < l; ++ i) {
            ComponentConstructor[componentProperties[i]] = components[componentName][componentProperties[i]];
          }
          extensionInstance[componentName] = ComponentConstructor;
        }

        resources = services[serviceName].resources;
        resourceNames = Object.keys( resources );
        for( j = 0, m = resourceNames.length; j < m; ++ j ) {
          resourceName = resourceNames[j];
          ResourceConstructor = resources[resourceName].bind( null, service );
          var resourceProperties = Object.keys(resources[resourceName]);
          for (i = 0, l = resourceProperties.length; i < l; ++ i) {
            ResourceConstructor[resourceProperties[i]] = resources[resourceName][resourceProperties[i]];
          }
          extensionInstance[resourceName] = ResourceConstructor;
        }
      }
    }

    components = extension.components;
    componentNames = Object.keys( components );
    for( i = 0, l = componentNames.length; i < l; ++ i ) {
      componentName = componentNames[i];
      ComponentConstructor = components[componentName];
      extensionInstance[componentName] = ComponentConstructor;
    }
    
    resources = extension.resources;
    resourceNames = Object.keys( resources );
    for( i = 0, l = resourceNames.length; i < l; ++ i ) {
      resourceName = resourceNames[i];
      ResourceConstructor = resources[resourceName];
      extensionInstance[resourceName] = ResourceConstructor;
    }

    this._extensions[extension.name] = extensionInstance;
    if( !this.hasOwnProperty( name ) ) {
      this[extension.name] = extensionInstance;
    }
    
    return this;
  }
  
  function unregisterExtension( extension ) {
    throw new Error( "not implemented" );
  }
  
  function findExtension( name ) {
    if( this._extensions.hasOwnProperty( name ) ) {
      return this._extensions[name];
    }
    
    return undefined;
  }
  
  function hasExtension( name ) {
    return this._extensions.hasOwnProperty( name );
  }
  
  Engine.prototype = {
      isRunning: isRunning,
      suspend: suspend,
      resume: resume,
      attach: attach,
      detach: detach,
      registerExtension: registerExtension,
      unregisterExtension: unregisterExtension,
      findExtension: findExtension,
      hasExtension: hasExtension,
      get: get,
      loaders: loaders,
      math: _Math
  };
  
  return Engine;
  
});