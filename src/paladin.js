(function (window, document) {
    
// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
    var rest = this.slice( (to || from) + 1 || this.length );
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

 /***
 * Paladin
 * 
 * This is where we put all of our goodies. Some are instances, like the subsystems,
 * and others are prototypes to be used and extended.
 */
var Paladin = window.Paladin = function ( options ) {
  var paladin = this;  

  /***
   * Tasker
   * 
   * Provides a mechanism for scheduling callbacks to run each frame.
   */
  function Tasker() {

      this.CONT = 0;
      this.DONE = 1;
      this.AGAIN = 2;

      var nextId = 0,
          tasksById = {},
          terminate = false,
          that = this;
      
      this.run = function() {
          for( var id in tasksById ) {
              var task = tasksById[id];
              var last = task.time;
              task.time = Date.now();
              task.dt = task.time - last;
              task.elapsed = task.time - task.start;
              if( task.run ) {
                  if( task.DONE === task._callback( task ) ) {
                      task.run = false;
                      that.remove( task );
                  }
              }
          }
          
          if( !terminate ) {
              setTimeout( that.run, 0 );
          }
      };

      this.terminate = function() {
          terminate = true;
      };

      this.add = function( options ) {
          var id = nextId ++;
          var task = {
              _callback: options.callback || function () {},            
              _id: id,
              time: Date.now(),
              run: true,
              dt: 0,
              elapsed: 0,
              start: Date.now(),
              
              DONE: 0,
              CONTINUE: 1,
              AGAIN: 2,
              
              suspend: function() {
                  this.run = false;
              },
              resume: function() {
                  this.run = true;
              }
          };
          
          tasksById[id] = task;
          return task;
      };

      this.remove = function( task ) {
          if( task._id in tasksById ) {
              delete tasksById[task._id];
          }
      };
      
      this.hasTask = function( task ) {
          if( task._id in tasksById )
              return true;
          else
              return false;
      };
      
  };

  /***
   * Loader
   * 
   * Provide resource loaders for game assets like models, textures and sounds.
   */
  function Loader() {
    
      var that = this,
          graphics = undefined,
          physics = undefined,
          sound = undefined;

  };

  function KeyboardInput( messenger, element ) {

      var that = this;
      var TYPE = 'keyboard';
      var KEYMAP = {
              0: 'meta',
              16: 'shift',
              17: 'ctrl',
              18: 'alt',
              27: 'escape',
              37: 'left',
              38: 'up',
              39: 'right',
              40: 'down'
      };
      for( var key = 48; key <= 90; ++ key )
          KEYMAP[key] = String.fromCharCode( key ).toLocaleLowerCase();

      var UNDEFINED = '?';
      var ALL = '*';
      var MODIFIERS = [0, 16, 17, 18];

      var processEvent = function( event ) {
          var inputs = [];
          
          if( event.shiftKey || 16 == event.keyCode )
              inputs.push( KEYMAP[16] );
          if( event.ctrlKey || 17 == event.keyCode )
              inputs.push( KEYMAP[17] );
          if( event.altKey || 18 == event.keyCode )
              inputs.push( KEYMAP[18] );
          if( event.metaKey || 0 == event.keyCode )
              inputs.push( KEYMAP[0] );
          
          if( KEYMAP.hasOwnProperty( event.keyCode ) )
              inputs.push( KEYMAP[event.keyCode] );
          else
              inputs.push( UNDEFINED );

          return inputs;
      };
      
      var hashInput = function( input, state ) {
          var result = TYPE;
          
          var hash = [];
          var keymapKeys = Object.keys( KEYMAP );
          for( var i = 0; i < keymapKeys.length; ++ i ) {
              var key = keymapKeys[i];
              if( input.indexOf( KEYMAP[key]) >= 0 )
                  hash.push( key );
          }
          result += ':' + hash.join( '-' );
          
          result += ':';
          if( null != state )
              result += state ? 'true' : 'false';
          
          return result;
      };
      
      this.Event = function( input, state ) {
          return hashInput( input, state );
      };

      this.handleKeyDown = function( event ) {
          var event = that.Event( processEvent( event ), true );
          messenger.send( {
              event: event,
              parameters: []
          } );
      };

      this.handleKeyUp = function( event ) {
          var event = that.Event( processEvent( event ), false );
          messenger.send( {
              event: event,
              parameters: []
          } );
      };

      element.addEventListener( 'keydown', this.handleKeyDown, true );
      element.addEventListener( 'keyup', this.handleKeyUp, true );

  };
  
  function MouseInput( messenger, element ) {

      var that = this;
      var TYPE = 'mouse';
      var KEYMAP = {
              0: 'meta',
              16: 'shift',
              17: 'ctrl',
              18: 'alt',
      };
      var BUTTONMAP = {
              0: 'mouse1',
              1: 'mouse3',
              2: 'mouse2'
      };
      var WHEELMAP = {
              0: 'wheel-up',
              1: 'wheel-down'
      };
      var UNDEFINED = '?';
      var ALL = '*';
      var MODIFIERS = [0, 16, 17, 18];

      var position = {
              x: undefined,
              y: undefined
      };
      
      var updateInputState = function( event ) {
          position.x = event.pageX;
          position.y = event.pageY;
      };

      var processEvent = function( event ) {
          var inputs = [];
          
          if( event.shiftKey || 16 == event.keyCode )
              inputs.push( KEYMAP[16] );
          if( event.ctrlKey || 17 == event.keyCode )
              inputs.push( KEYMAP[17] );
          if( event.altKey || 18 == event.keyCode )
              inputs.push( KEYMAP[18] );
          if( event.metaKey || 0 == event.keyCode )
              inputs.push( KEYMAP[0] );
          
          if( event instanceof MouseEvent &&
                  BUTTONMAP.hasOwnProperty( event.button ) )
              inputs.push( BUTTONMAP[event.button] );
          else if( event instanceof DOMMouseScroll )
              inputs.push( (event.detail < 0) ? WHEELMAP[0] : WHEELMAP[1] );
          else
              inputs.push( UNDEFINED );
          
          updateInputState( event );
          return inputs;
      };
      
      var hashInput = function( input, state ) {
          var result = TYPE;
          
          var hash = [];
          var keymapKeys = Object.keys( KEYMAP );
          for( var i = 0; i < keymapKeys.length; ++ i ) {
              var key = keymapKeys[i];
              if( input.indexOf( KEYMAP[key] ) >= 0 )
                  hash.push( key );
          }
          result += ':' + hash.join( '-' );
          
          hash = [];
          var buttonmapKeys = Object.keys( BUTTONMAP );
          for( var i = 0; i < buttonmapKeys.length; ++ i ) {
              var button = buttonmapKeys[i];            
              if( input.indexOf( BUTTONMAP[button] ) >= 0 ) {
                  hash.push( button );
              }
          }
          result += ':' + hash.join( '-' );
          
          hash = [];
          var wheelmapKeys = Object.keys( WHEELMAP );
          for( var i = 0; i < wheelmapKeys.length; ++ i ) {
              var wheel = wheelmapKeys[i];
              if( input.indexOf( WHEELMAP[wheel] ) >= 0 ) {
                  hash.push( wheel );
              }
          }
          result += ':' + hash.join( '-' );
          
          result += ':';
          if( null != state )
              result += state ? 'true' : 'false';
          
          return result;
      };
      
      this.Event = function( input, state ) {
          return hashInput( input, state );
      };
     
      this.handleMouseDown = function( event ) {
          var event = that.Event( processEvent( event ), true );
          messenger.send( {
              event: event,
              parameters: [position]
          } );
      };

      this.handleMouseUp = function( event ) {
          var event = that.Event( processEvent( event ), false );
          messenger.send( {
              event: event,
              parameters: [position]
          } );
      };

      this.handleMouseWheel = function( event ) {
          var event = that.Event( processEvent( event ), null );
          messenger.send( {
              event: event,
              parameters: [position]
          } );
      };
      
      this.handleMouseMove = function( event ) {
          processEvent( event );
      };
      
      element.addEventListener( 'mousedown', this.handleMouseDown, true );
      element.addEventListener( 'mouseup', this.handleMouseUp, true );
      element.addEventListener( 'DOMMouseScroll', this.handleMouseWheel, true );
      element.addEventListener( 'mousemove', this.handleMouseMove, true );

  };
  
  function TouchInput( messenger, element ) {
      
      var that = this;
      
      var TYPE = 'touch';
      var KEYMAP = {
              0: 'meta',
              16: 'shift',
              17: 'ctrl',
              18: 'alt',
      };
      var UNDEFINED = '?';
      var ALL = '*';
      var MODIFIERS = [0, 16, 17, 18];

      var activeTouches = {};
      
      var updateInputState = function( event ) {
          var touches = event.changedTouches;
          switch( event.type ) {
          case "touchstart":
          case "touchmove":
              for( var touch in touches )
                  activeTouches[touch.identifier] = touch;
              break;
          case "touchend":
          case "touchcancel":
              for( var touch in touches )
                  delete activeTouches[touch.identifier];
              break;
          }
      };
      
      var processEvent = function( event ) {          
          var inputs = [];
          
          updateInputState( event );          
          return inputs;
      };
      
      var hashInput = function( input, state ) {
          var result = TYPE;
          
          var hash = [];
          for( var key in Object.keys( KEYMAP ) ) {
              if( input.indexOf( KEYMAP[key] ) >= 0 )
                  hash.push( key );
          }
          result += ':' + hash.join( '-' );
                 
          result += ':';
          if( null != state )
              result += state ? 'true' : 'false';
          
          return result;
      };
      
      this.Event = function( input, state ) {
          return hashInput( input, state );
      };
      
      var buildParameterList = function( touches ) {
          var parameters = [];
          for( var i = 0; i < touches.length; ++ i ) {
              var touch = touches[i];
              parameters.push( {
                  identifier: touch.identifier,
                  position: {
                      x: touch.pageX,
                      y: touch.pageY
                  }
              } );
          }
          return parameters;
      };
     
      this.handleTouchStart = function( event ) {
          event.preventDefault();
          var options = {
              event: that.Event( processEvent( event ), true ),
              parameters: buildParameterList( event.changedTouches )
          };
          messenger.send( options );
      };

      this.handleTouchEnd = function( event ) {
          event.preventDefault();
          var options = {
              event: that.Event( processEvent( event ), false ),
              parameters: buildParameterList( event.changedTouches )
          };
          messenger.send( options );
      };

      this.handleTouchCancel = function( event ) {
          var event = that.Event( processEvent( event ), false );
          messenger.send( {
              event: event,
              parameters: buildParameterList( event.changedTouches )
          } );

      };
      
      this.handleTouchMove = function( event ) {
          event.preventDefault();
          processEvent( event );
      };
      
      element.addEventListener( 'touchstart', this.handleTouchStart, true );
      element.addEventListener( 'touchend', this.handleTouchEnd, true );
      element.addEventListener( 'touchcancel', this.handleTouchCancel, true );
      element.addEventListener( 'touchmove', this.handleTouchMove, true );
      
  };

  function InputMap( messenger ) {

      var map = {};
          id = nextEntityId ++;
      var that = this;

      this.add = function( destinationEvent, sourceEvent ) {
          if( !map.hasOwnProperty( sourceEvent ) )
              map[sourceEvent] = [];
              messenger.listen( {
                  entity: this,
                  event: sourceEvent,
                  callback: dispatch,
                  parameters: [ sourceEvent ],
                  persistent: true
              } );
          map[sourceEvent].push( destinationEvent );
      };

      this.remove = function( destinationEvent, sourceEvent ) {
          if( map.hasOwnProperty( sourceEvent ) ) {
              var index = map[sourceEvent].indexOf( destinationEvent );
              if( index >= 0 ) {
                  map[sourceEvent].remove( destinationEvent );
                  if( 0 == map[sourceEvent].length ) {
                      messenger.ignore( {
                          event: sourceEvent
                      } );
                      delete map[sourceEvent];
                  }
              }
          }
      };

      var dispatch = function( parameters ) {
          var sourceEvent = parameters[0];
          if( map.hasOwnProperty( sourceEvent ) ) {
              for( var i = 0; i < map[sourceEvent].length; ++ i ) {
                  messenger.send( {
                      event: map[sourceEvent][i]
                  } );
              }
          }
      };

      this.getId = function() {
          return id;
      };

  };

  /***
   * Messenger
   * 
   * Provide a mechanism for game entities to listen for events and to send
   * events. An event is an arbitrary string. Some Javascript events are
   * handled here and converted to game engine events so that entities can
   * listen for them.
   */
  function Messenger( tasker ) {

      var callbacks = {},
          queue = [];
      
      this.listen = function( options ) {
          var id = options.entity.getId();
          
          if( !callbacks.hasOwnProperty( options.event ) )
              callbacks[options.event] = {};
                    
          callbacks[options.event][id] = {
              callback: options.callback.bind( options.entity ),
              parameters: options.parameters,
              persistent: options.persistent
          };          
      };
      
      this.ignore = function( options ) {          
          if( callbacks.hasOwnProperty( options.event ) ) {
              var listeners = callbacks[options.event];
              if( listeners.hasOwnProperty( options.entity.getId() ) )
                  delete listeners[options.entity.getId()];
              if( 0 == Object.keys( listeners ).length )
                  delete callbacks[options.event];
          }
      };
      
      this.ignoreAll = function( options ) {
          // Not implemented.
      };
      
      this.send = function( options ) {
        queue.push( options );
      };

      var dispatch = function() {
          while( queue.length > 0 ) {
              var options = queue.shift();
              if( callbacks.hasOwnProperty( options.event ) ) {
                  listeners = callbacks[options.event];
                  for( var id in listeners ) {
                      var callback = listeners[id].callback,
                      parameters = listeners[id].parameters,
                      persistent = listeners[id].persistent;
                  
                      callback( parameters.concat( options.parameters ) );
                      if( !persistent )
                          delete listeners[id];
                  }
                  if( 0 == Object.keys( listeners ).length )
                      delete callbacks[options.event];
              }
          }
      };
      var task = tasker.add( {
        callback: function( task ) {
            dispatch();
        }
      } );

      var hashInput = function( name, state ) {
          var result = 'client:' + name;
                 
          result += ':';
          if( null != state )
              result += state ? 'true' : 'false';
          
          return result;
      };
      
      this.Event = function( name, state ) {
          return hashInput( name, state );
      };

  };

  /***
   * Entity
   * 
   * An entity is a basic game object. It is a container object for components. Each
   * entity has a unique identifier.
   */
  var nextEntityId = 0;   // FIXME(alan.kligman@gmail.com): This is a hack.
  function Entity( options ) {
      
      var id = nextEntityId ++,
          componentsByType = {},
          parent = null,
          that = this;   
      
      this.children = [];
          
      this.spatial = new SpatialComponent();
      
      this.getId = function() {
          return id;
      };

      this.listen = function( options ) {
          paladin.messenger.listen( {
              entity: that,
              event: options.event,
              callback: options.callback,
              parameters: options.parameters || [],
              persistent: options.persistent || true
          } );
      };
      
      this.ignore = function( options ) {
          paladin.messenger.ignore( {
              entity: that,
              event: options.event
          } );
      };
      
      this.send = function( options ) {
          paladin.messenger.send( {
              event: options.event,
              parameters: options.parameters || []
          } );
      };
      
      this.addComponent = function( component ) {
          var componentType = component.getType();
          if( !componentsByType.hasOwnProperty( componentType ) )
              componentsByType[componentType] = [];
          componentsByType[componentType].push( component );
          component.onAdd( this );
      };
      
      this.removeComponent = function( component ) {
          var componentType = component.getType();
          if( componentsByType.hasOwnProperty( componentType ) ) {
              for( var i = 0; i < componentsByType[componentType].length; ++ i ) {
                  if( component === componentsByType[componentType][i] ) {
                      component.onRemove( this );
                      componentsByType[componentType].remove( i );
                      break;
                  }
              }
          }
      };
      
      this.getComponents = function( componentType, subType ) {
          if( componentType && componentsByType.hasOwnProperty( componentType ) ) {
              var components = componentsByType[ componentType ];
              if ( components && subType ) {
                  for( var i = 0; i < components.length; ++ i ) {
                      if ( components[i].subtype.indexOf( subType ) > -1 ) {
                          return components[i];
                      }
                  }
              }
              return components;
          }
          else {
              var components = [];
              for( var i = 0; i < componentsByType.length; ++ i ) {
                  components.concat( componentsByType[i] );
              }
              return components;
          }
      };
      
      this.hasComponent = function( componentType ) {
          return componentType && componentsByType.hasOwnProperty( componentType );
      };
      
      this.setParent = function( newParentEntity ) {
          if( parent )
              parent.children.remove( this );

          newParentEntity.children.push( this );
          this.spatial.setParent( newParentEntity.spatial );
          parent = newParentEntity;
      };

      options = options || {};

      options.parent && this.setParent( options.parent );

      if ( options.children ) {
        for ( var i=0; i<options.children.length; ++i) {
          options.children[i].setParent(this);
        } //for
      } //if

      if ( options.listeners ) {
        for ( var eventName in options.listeners ) {
          var callback, params, persistent;
          if ( options.listeners[ eventName ] instanceof Function ) {
            callback = options.listeners[ eventName ];
          }
          else {
            callback = options.callback;
            params = options.parameters;
            persistent = options.persistent;
          }
          this.listen( {
            event: eventName,
            callback: callback,
            parameters: params,
            persistent: persistent
          });
        } //for
      } //if

      if ( options.components ) {
        for ( var i=0; i<options.components.length; ++i ) {
          this.addComponent( options.components[ i ] );
        } //for
      } //if

      options.init && options.init( this );


  };

  function Scene( options ) {
      options = options || {};
      this.graphics = new paladin.graphics.Scene( {
          fov: 60,
          resizable: true
      } );
      this.spatial = new SpatialComponent();
      this.children = [];
      
      this.graphics.bindSceneObject( this.spatial.sceneObjects.graphics );
      paladin.graphics.pushScene( this );

      this.setActiveCamera = function ( camera ) {
          this.graphics.setCamera( camera.camera );
      };
  };

  /***
   * Component (prototype interface)
   * 
   * A component is a basic unit of game functionality. Components are narrow in scope and are composed
   * together by entities to form game objects.
   */
  function Component( options ) {
      this.type = options.type || undefined;
      this.subtype = options.subtype || [];
      this.requires = options.requires || [];
      this.parent = null;
  };
  Component.prototype.getType = function() {
      return this.type;
  };
  Component.prototype.getSubtype = function() {
      return this.subtype;
  };

  function SpatialComponent( position, rotation ) {
      
      this._position = position ? position : [0, 0, 0];   // X, Y, Z
      this._rotation = rotation ? rotation : [0, 0, 0];  // Roll, pitch, yaw
       
      this.__defineGetter__( 'position', function() {
          return this._position;
      } );
      this.__defineSetter__( 'position', function( position ) {
          this._position[0] = position[0];
          this._position[1] = position[1];
          this._position[2] = position[2];
      } );
      this.__defineGetter__( 'rotation', function() {
          return this._rotation;
      } );
      this.__defineSetter__( 'rotation', function( rotation ) {
          this._rotation[0] = rotation[0];
          this._rotation[1] = rotation[1];
          this._rotation[2] = rotation[2];
      } );
      
      this.sceneObjects = {
          graphics: new paladin.graphics.SceneObject( {
              position: this.position,
              rotation: this.rotation
          } ),
          physics: null,
          sound: null
      };

  }
  SpatialComponent.prototype = new Component( { 
      type: 'core',
      subtype: [ 'spatial' ]
  } );
  SpatialComponent.prototype.constructor = SpatialComponent;
  SpatialComponent.prototype.setParent = function( newParentSpatial ) {
      newParentSpatial.sceneObjects.graphics.bindChild( this.sceneObjects.graphics );
      this.parent = newParentSpatial;
  };

  function CameraComponent( options ) {
      options = options || {};
      this.object = new paladin.graphics.SceneObject();
      this.camera = (options && options.camera) ? options.camera : new paladin.graphics.Camera({
        targeted: options.targeted
      });
      this.camera.setParent( this.object );
      this.entity = null;
      if (options.position) {
          this.object.position = options.position;
      }
      if (options.rotation) {
          this.object.rotation = options.rotation;
      }
  }
  CameraComponent.prototype = new Component( {
      type: 'graphics',
      subtype: [ 'camera' ],
      requires: [ 'spatial' ]
  } );
  CameraComponent.prototype.constructor = CameraComponent;
  CameraComponent.prototype.onAdd = function( entity ) {
      entity.spatial.sceneObjects.graphics.bindChild( this.object );
      this.entity = entity;
  };
  CameraComponent.prototype.onRemove = function( entity ) {
      /* Note(alan.kligman@gmail.com):
       * Not implemented.
       */
  };

  function ModelComponent( options ) {
      this.object = new paladin.graphics.SceneObject( { mesh: options.mesh } );    
      this.mesh = (options && options.mesh) ? options.mesh : null;
      this.material = (options && options.material) ? options.material : null;    
      this.entity = null;

      if (options.position) {
          this.object.position = options.position;
      }
      if (options.rotation) {
          this.object.rotation = options.rotation;
      }
  };
  ModelComponent.prototype = new Component( {
      type: 'graphics',
      subtype: [ 'model' ],
      requires: [ 'spatial' ]
  } );
  ModelComponent.prototype.constructor = ModelComponent;
  ModelComponent.prototype.onAdd = function( entity ) {
      entity.spatial.sceneObjects.graphics.bindChild( this.object );
      this.entity = entity;
  };
  ModelComponent.prototype.onRemove = function( entity ) {
      /* Note(alan.kligman@gmail.com):
       * Not implemented.
       */
  };
  ModelComponent.prototype.setMesh = function( mesh ) {
      this.mesh = mesh;
      this.object.obj = mesh;
  };
  ModelComponent.prototype.setMaterial = function( material ) {
      this.material = material;
  };

  var that = this;
  this.debug = options && options.debug ? console.log : function () {};
  this.tasker = new Tasker();
  this.messenger = new Messenger( this.tasker );
  this.loader = new Loader();

  this.run = function () {    
      ( options && options.run ) && options.run ( that );
      that.tasker.run();
  };

  // Init instance of each subsystem and store reference as subsystem name
  var subsystems = paladin.subsystems = Paladin.subsystem.init( options );
  for ( subsystemName in subsystems ) {
    paladin[ subsystemName ] = subsystems[ subsystemName ];
  }
  
  // Create input handlers
  this.keyboardInput = new KeyboardInput( this.messenger, window );
  this.mouseInput = new MouseInput( this.messenger, this.graphics.getCanvas() );
  this.touchInput = new TouchInput( this.messenger, this.graphics.getCanvas() );
  
  // Expose Paladin objects
  this.Entity = Entity;
  this.Scene = Scene;
  this.InputMap = InputMap;

  // Expose components
  this.component = {
    Spatial: SpatialComponent,
    Camera: CameraComponent,
    Model: ModelComponent,
    Light: null
  };

  // run user-specified setup function
  ( options && options.setup ) && options.setup( paladin );

}; //Paladin

// Attach prototypes to Paladin.
})( window, document );
