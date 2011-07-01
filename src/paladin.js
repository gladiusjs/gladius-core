(function (window, document) {

function Paladin() {
    
    this.tasker = new Tasker();
    this.messenger = new Messenger();
    this.mouseWatcher = new MouseWatcher();
    
};
Paladin.prototype.constructor = Paladin;
Paladin.prototype.run = function() {    
    this.tasker.run(); 
};
window.Paladin = Paladin;

function Tasker() {

    // enumerations
    this.CONT = 0;
    this.DONE = 1;
    this.AGAIN = 2;

    // private vars
    var nextId = 0,
        tasksById = {},
        tasksByName = {},
        terminate = false,
        that = this;
    
    this.run = function() {
        for( var id in tasksById ) {
            var task = tasksById[id];
            task.time = Date.now();
            if( task.DONE === task._callback( task ) ) {
                that.remove( task );
            }
        }
        
        if( !terminate ) {
            setTimeout( that.run, 0 );
        }
    }; //run

    this.terminate = function() {
        terminate = true;
    }; //terminate

    this.add = function( options ) {
        var id = nextId ++;
        var task = {
            _callback: options.callback || function () {},            
            _id: id,
            name: options.name || undefined,
            time: Date.now(),
            CONT: 0,
            DONE: 1,
            AGAIN: 2
        };
        
        tasksById[id] = task;
        if( task.name )
            tasksByName[task.name] = task;
        return task;
    }; //add

    this.remove = function( task ) {
        if( task._id in tasksById ) {
            delete tasksById[task._id];
        }
        if ( task.name && task.name in tasksByName ) {
            delete tasksByName[task.name];
        }
    };

}; //Tasker

function MouseWatcher( tasker ) {

    var mousePosition = {
            x: undefined,
            y: undefined
        },
        that = this;    

    this.getX = function() {
        return mousePosition['x'];
    };

    this.getY = function() {
        return mousePosition['y'];
    };

    this._mouseMove = function( event ) {
        mousePosition['x'] = event.pageX;
        mousePosition['y'] = event.pageY;
    };

    window.addEventListener( 'mousemove', this._mouseMove, true );
    window.addEventListener( 'mouseover', this._mouseMove, true );
};

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
                
                
                // Call the handler.
                callback( parameters.concat( options.parameters ) );
                if( !persistent )
                    delete callbacks[options.event][id];
            }
        }
    };

    // Handle Javascript events.
    
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
        
        result = components.join( '-' );
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

        result = components.join( '-' );
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

        result = components.join( '-' );
        return result;
    };
    
    window.addEventListener( 'keydown', this._keyDown, true );
    window.addEventListener( 'keyup', this._keyUp, true );
    window.addEventListener( 'mousedown', this._mouseButtonDown, true );
    window.addEventListener( 'mouseup', this._mouseButtonUp, true );
    window.addEventListener( 'DOMMouseScroll', this._mouseWheelScroll, true );
};

// FIXME(alan.kligman@gmail.com): This is a hack.
var nextEntityId = 0;

function Entity() {
    
    var id = nextEntityId ++,
        componentsByType = {},
        componentsByName = {},
        that = this;
    
    this.getId = function() {
        return id;
    };

    this.listen = function( options ) {
        Paladin.messenger.listen( {
            entity: that,
            event: options.event,
            callback: options.callback,
            parameters: options.parameters || [],
            persistent: options.persistent || true
        } );
    };
    
    this.ignore = function( options ) {
        Paladin.messenger.ignore( {
            entity: that,
            event: options.event
        } );
    };
    
    this.send = function( options ) {
        Paladin.messenger.send( {
            event: options.event,
            parameters: options.parameters || []
        } );
    };
    
    this.addComponent = function( options ) {
        var componentType = options.component.getType();
        if( !that.componentsByType.hasOwnProperty( componentType ) ) {
            that.components[componentType] = [];
        }
        that.componentsByType[componentType].push( options.component );

        if( options.name ) {
            if( !that.componentsByName.hasOwnProperty( options.name ) ) {
                that.componentsByName[options.name] = [];
            }
            that.componentsByName[options.name].push( options.component );
        }
    };
    
    this.removeComponent = function( options ) {

    };
    
    this.findComponents = function( options ) {
        
    };
};

// Placeholder prototypes for a few things we'll need.
function Point3() {
    this.x = undefined;
    this.y = undefined;
    this.z = undefined;
};

function Vector3() {
    this.x = undefined;
    this.y = undefined;
    this.z = undefined;
};

function Component( options ) {
    this.type = options.type || undefined;
    this.subtype = options.subtype || [];
};
Component.prototype.getType = function() {
    return this.type;
};
Component.prototype.getSubtype = function() {
    return this.subtype;
};

function SpatialComponent() {
    this.position = new Point3();   // X, Y, Z
    this.rotation = new Vector3();  // Roll, pitch, yaw
}
SpatialComponent.prototype = new Component( { 
    type: 'spatial' 
} );
SpatialComponent.prototype.constructor = SpatialComponent;

function CameraComponent( options ) {
    this.camera = options.camera || new Paladin.graphics.Camera();
}
CameraComponent.prototype = new Component( {
    type: 'graphics',
    subtype: [ 'camera' ]
} );

function ModelComponent( options ) {
    this.mesh = options.mesh || undefined;
    this.object = new Paladin.graphics.SceneObject();
};
ModelComponent.prototype = new Component( {
    type: 'graphics',
    subtype: [ 'model' ]
} );


// Attach core instances to Paladin.
Paladin.tasker = new Tasker();
Paladin.messenger = new Messenger();
Paladin.loader = undefined;     // Not implemented yet.
Paladin.mouseWatcher = new MouseWatcher();
Paladin.component = {};

// These are registration points for external implementations. They should be instances.
Paladin.graphics = undefined;
Paladin.physics = undefined;
Paladin.sound = undefined;

// Attach prototypes to Paladin.
Paladin.Entity = Entity;
Paladin.component.Spatial = SpatialComponent;
Paladin.component.Camera = CameraComponent;
Paladin.component.Model = ModelComponent;

})( window, document );
