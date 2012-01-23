/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    var lang = require( 'lang' );
    var Delegate = require( 'common/delegate' );
    var Event = require( 'core/event' );
    
    var IComponent = function( options ) {

        options = options || {};

        var _type = options.type || undefined;
        Object.defineProperty( this, 'type', {
            get: function() {
                return _type;
            }
        });

        var _depends = options.depends || [];
        Object.defineProperty( this, 'depends', {
            get: function() {
                return _depends;
            }
        });
        
    };

    var Component = function( options, c ) {

        option = options || {};        

        var r = function( options ) {

            options = options || {};
            var that = this;

            var _owner = null;
            Object.defineProperty( this, 'owner', {
                get: function() {
                    return _owner;
                },
                set: function( value ) {
                    if( value != _owner ) {
                        var previous = _owner;
                        _owner = value;
                        _handleEvent( new Event({
                            type: 'ComponentOwnerChanged',
                            queue: false,
                            data: {
                                current: value,
                                previous: previous
                            }
                        }));
                    }
                }
            });
            
            var _queuedEvents = [];
            Object.defineProperty( this, 'queuedEvents', {
                get: function() {
                    return _queuedEvents;
                }
            });
            
            var _handleEvent = function( event ) {
                if( that.hasOwnProperty( 'on' + event.type ) ) {
                    if( event.queue ) {
                        _queuedEvents.push( event );            // Queue the event to be handled later
                    } else {
                        var handler = that['on' + event.type];  // Find the handler
                        handler.call( that, event );            // Invoke the handler with the event      
                    }
                }
            };
            Object.defineProperty( this, 'handleEvent', {
                get: function() {
                    return _handleEvent;
                }
            });
            
            // Handle the next queued event; Returns the size of the remainder
            var _handleQueuedEvent = function() {
                if( _queuedEvents.length > 0 ) {
                    var event = _queuedEvents.shift();
                    var handler = that['on' + event.type];  // Find the handler
                    handler.call( that, event );            // Invoke the handler with the event
                }
                return _queuedEvents.lenght;
            };
            Object.defineProperty( this, 'handleQueuedEvent', {
                get: function() {
                    return _handleQueuedEvent;
                }
            });

            
            c.call( this, options );
            
        };
        r.prototype = new IComponent( options );
        r.prototype.constructor = r;

        return r;

    };

    return Component;

});
