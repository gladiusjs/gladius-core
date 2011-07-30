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

  /***
   * MouseWatcher
   * 
   * Caches the current mouse position and provides access to the coordinates.
   */
  function MouseWatcher() {

      var _mousePosition = {
              X: undefined,
              Y: undefined
          },
          _mouseDelta = {
              dX: undefined,
              dY: undefined
          };
      
      this.__defineGetter__( 'X', function() {
          return _mousePosition.X;
      } );
      this.__defineGetter__( 'Y', function() {
          return _mousePosition.Y;
      } );
      this.__defineGetter__( 'dX', function() {
          return _mouseDelta.dX;
      } );
      this.__defineGetter__( 'dY', function() {
          return _mouseDelta.dY;
      } );
      
      this._mouseMove = function( event ) {
          if( _mousePosition.X )
              _mouseDelta.dX = _mousePosition.X - event.pageX;
          if( _mousePosition.Y )
              _mouseDelta.dY = _mousePosition.Y - event.pageY;
          
          _mousePosition.X = event.pageX;
          _mousePosition.Y = event.pageY;
      };

      window.addEventListener( 'mousemove', this._mouseMove, true );
      window.addEventListener( 'mouseover', this._mouseMove, true );
  };
  
  function TouchWatcher() {
      
      var _touches = {};

      this._touchStart = function( event ) {
          for( var touch in touches ) {
              _touches[touch.identifier] = {
                  X: touch.pageX,
                  Y: touch.pageY
              };
          }
      };
      
      this._touchMove = function( event ) {
          for( var touch in touches ) {
              _touches[touch.identifier].X = touch.pageX;
              _touches[touch.identifier].Y = touch.pageY;
          }
      };
      
      this._touchEnd = function( event ) {
          for( var touch in touches ) {
              delete _touches[touch.identifier];
          }
      };
      
      this.getTouch = function( touch ) {
          if( _touches.hasOwnProperty( touch ) ) {
              return _touches[touch];
          }
          else {
              return {
                  x: undefined,
                  y: undefined
              };
          }
      };
      
      window.addEventListener( 'touchstart', this._touchMove, true );
      window.addEventListener( 'touchmove', this._touchMove, true );
      window.addEventListener( 'touchend', this._touchMove, true );
  };

  /***
   * Messenger
   * 
   * Provide a mechanism for game entities to listen for events and to send
   * events. An event is an arbitrary string. Some Javascript events are
   * handled here and converted to game engine events so that entities can
   * listen for them.
   */
  function Messenger() {
      
      var callbacks = {},
          that = this;
      
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
              if( callbacks[options.event].hasOwnProperty( options.entity.getId() ) )
                  delete callbacks[options.event][options.entity.getId()];
              if( 0 == Object.keys( callbacks[options.event] ).length )
                  delete callbacks[options.event];
          }
      };
      
      this.ignoreAll = function( options ) {
          
      };
      
      this.send = function( options ) {
          if( callbacks.hasOwnProperty( options.event ) ) {
              listeners = callbacks[options.event];
              for( var id in listeners ) {
                  var callback = listeners[id].callback,
                      parameters = listeners[id].parameters,
                      persistent = listeners[id].persistent;
                  
                  callback( parameters.concat( options.parameters ) );
                  if( !persistent )
                      delete callbacks[options.event][id];
              }
          }
      };

      this._keyDown = function( event ) {
          that.send( {
              event: that._convertKeyEvent( event, 'down' ),
              parameters: []
          } );
      };
      
      this._keyUp = function( event ) {
          that.send( {
              event: that._convertKeyEvent( event, 'up' ),
              parameters: []
          } );        
      };

      this._mouseButtonDown = function( event ) {
          that.send( {
              event: that._convertMouseButtonEvent( event, 'down' ),
              parameters: []
          } );        
      };

      this._mouseButtonUp = function( event ) {
          that.send( {
              event: that._convertMouseButtonEvent( event, 'up' ),
              parameters: []
          } );        
      };

      this._mouseWheelScroll = function( event ) {
          that.send( {
              event: that._convertMouseWheelEvent( event ),
              parameters: []
          } );        
      };
      
      this._touchDown = function( event ) {
          for( var touch in touches ) {
              that.send( {
                  event: that._convertTouchEvent( event, 'down' ),
                  parameters: [touch.identifier]
              } );
          }
      };
      
      this._touchUp = function( event ) {
          for( var touch in touches ) {
              that.send( {
                  event: that._convertTouchEvent( event, 'up' ),
                  parameters: [touch.identifier]
              } );
          }
      };
      
      this._convertKeyEvent = function( event, mode ) {
          var code = event.keyCode;
          
          var components = [];
          if( event.shiftKey || code == 16 )
              components.push( 'shift' );
          if( event.ctrlKey || code == 17 )
              components.push( 'control' );
          if( event.altKey || code == 18 )
              components.push( 'alt' );
          if( event.metaKey || code == 0 )
              components.push( 'meta' );

          if( code == 0 || (code >= 16 && code <= 18) || code == 224 ) {
              // These are modifier keys, do nothing.
          }
          else if( code == 27 )
              components.push( 'escape' );
          else if( code == 37 )
              components.push( 'larrow' );
          else if( code == 38 )
              components.push( 'uarrow' );
          else if( code == 39 )
              components.push( 'rarrow' );
          else if( code == 40 )
              components.push( 'darrow' );
          else if( (code >= 48 && code <= 90) )         
              components.push( String.fromCharCode( code ).toLocaleLowerCase() );
          else
              components.push( '<' + code + '>' );
          
          components.push( mode );
          
          var result = components.join( '-' );
          return result;
      };

      this._convertMouseButtonEvent = function( event, mode ) {
          var code = event.button;

          var components = [];
          if( event.shiftKey )
              components.push( 'shift' );
          if( event.ctrlKey )
              components.push( 'control' );
          if( event.altKey )
              components.push( 'alt' );
          if( event.metaKey )
              components.push( 'meta' );

          if( code == 0 )
              components.push( 'mouse1' );
          else if( code == 2 )
              components.push( 'mouse2' );
          else if( code == 1 )
              components.push( 'mouse3' );
          else
              components.push( '<' + code + '>' );

          components.push( mode );

          var result = components.join( '-' );
          return result;
      };

      this._convertMouseWheelEvent = function( event ) {
          var code = event.detail;

          var components = [];
          if( event.shiftKey )
              components.push( 'shift' );
          if( event.ctrlKey )
              components.push( 'control' );
          if( event.altKey )
              components.push( 'alt' );
          if( event.metaKey )
              components.push( 'meta' );

          if( code < 0 )
              components.push( 'wheel-up' );
          else if( code > 0 )
              components.push( 'wheel-down' );

          var result = components.join( '-' );
          return result;
      };
      
      this._convertTouchEvent = function( event, mode ) {
          var result = "touch-" + mode;
          return result;
      };
      
      window.addEventListener( 'keydown', this._keyDown, true );
      window.addEventListener( 'keyup', this._keyUp, true );
      window.addEventListener( 'mousedown', this._mouseButtonDown, true );
      window.addEventListener( 'mouseup', this._mouseButtonUp, true );
      window.addEventListener( 'DOMMouseScroll', this._mouseWheelScroll, true );
      window.addEventListener( 'touchstart', this._touchDown, true );
      window.addEventListener( 'touchend', this._touchUp, true );
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
  this.messenger = new Messenger();
  this.mouseWatcher = new MouseWatcher();
  this.touchWatcher = new TouchWatcher();
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

  // Expose Paladin objects
  this.Entity = Entity;
  this.Scene = Scene;

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
