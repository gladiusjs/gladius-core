/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {
    
    var lang = require( './lang' );
         
    return function( options ) {
        
        options = options || {};
        var _defaultManager = options.manager;
        
        var Task = function( options ) {
            
            options = options || {};

            var enums = {
                state: {
                    COMPLETE: 0,
                    CONTINUE: 1                    
                },
                priority: {
                    INPUT: 0,
                    UPDATE: 1,
                    RENDER: 2
                }
            };
            
            lang.extend( this, enums.state );
            
            var _manager = options.manager || _defaultManager || null;
            Object.defineProperty( this, 'manager', {
                get: function() {
                    return _manager;
                }
            });
            
            var _id = window.guid();
            Object.defineProperty( this, 'id', {
                get: function() {
                    return _id;
                }
            });
            
            var _callback = function() {
                if( this.COMPLETE === options.callback.apply( this, options.parameters ) )
                    this.active = false;
            };
            Object.defineProperty( this, 'callback', {
                get: function() {
                    return _callback;
                }
            });
            
            var _active = false;
            Object.defineProperty( this, 'active', {
                get: function() {
                    return _active;
                },
                set: function( value ) {
                    _active = value;
                }
            });

            var _priority;
            if( !options.hasOwnProperty( 'priority' ) ) {
                _priority = enums.priority.UPDATE;
            } else {
                if( !enums.priority.hasOwnProperty( options.priority ) ) {
                    throw 'invalid priority: ' + options.priority;
                } else {
                    _priority = enums.priority[options.priority];
                }
            }
            Object.defineProperty( this, 'priority', {
                get: function() {
                    return _priority;
                }
            });
            
            var _scheduled = false;
            Object.defineProperty( this, 'scheduled', {
                get: function() {
                    return _scheduled;
                },
                set: function( value ) {
                    _scheduled = value;
                }
            });
            
            this.suspend = function() {
                if( _active ) {
                    _active = false;
                    _manager.remove( this );
                }
            };
            
            this.resume = function() {
                if( !_active ) {
                    _active = true;
                    _manager.add( this );
                }
            };
            
            if( options.hasOwnProperty( 'active' ) ? options.active : true ) {
                this.resume();
            }             
                       
        };        
        
        return Task;
        
    };
    
});
