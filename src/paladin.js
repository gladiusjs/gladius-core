(function (window, document) {

function Paladin() {
    
    var that = this;
    
    if( this === window ) {
        throw new Error( 'Must instantiate Paladin with "new".' );
    }
    
};

window.Paladin = Paladin;

Paladin.prototype.run = function() {    
    Paladin.tasker.run();    
};

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
        // console.log( 'down', event.keyCode, String.fromCharCode( event.keyCode ), event.timeStamp );
        that.send( {
            event: that._convertKeyEvent( event, 'down' ),
            parameters: []
        } );
    };
    
    this._keyUp = function( event ) {
        // console.log( 'up', event.keyCode, String.fromCharCode( event.keyCode ), event.timeStamp );
        that.send( {
            event: that._convertKeyEvent( event, 'up' ),
            parameters: []
        } );        
    };
    
    this._convertKeyEvent = function( event, direction ) {
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
        
        components.push( direction );
        
        result = components.join( '-' );
        return result;
    };
    
    window.onkeydown = this._keyDown;
    window.onkeyup = this._keyUp;
    
};

// FIXME(alan.kligman@gmail.com): This is a hack.
var nextEntityId = 0;

function Entity() {
    
    var id = nextEntityId ++,
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
    
};

// Attach core instances to Paladin.
Paladin.tasker = new Tasker();
Paladin.messenger = new Messenger();

// Attach prototypes to Paladin.
Paladin.Entity = Entity;

/*
Tasker.prototype.add = function( name, callback ) {
};
Tasker.prototype.removeByName = function( name ) {    
};
*/
/*
Tasker.prototype.addDeferred = function( name, delay, callback ) {
    console.log( 'Task.addDeferred' );
};
*/

})( window, document );
