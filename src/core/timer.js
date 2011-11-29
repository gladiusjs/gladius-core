/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {
    
    return function( options ) {
        
        options = options || {};
        var _defaultTick = options.tick;
        
        var Timer = function( options ) {
            
            options = options || {};
            
            var _id = options.id || window.guid();
            var _tick = options.tick || _defaultTick || null;
            
            var _time = options.start || 0;
            Object.defineProperty( this, 'time', {
                get: function() {
                    return _time;
                }
            });
            
            var _delta = 0;
            Object.defineProperty( this, 'delta', {
                get: function() {
                    return _delta;
                }
            });
            
            var handleTick = function( delta ) {
                if( _active ) {
                    _delta = delta;
                    _time += delta;
                } else {
                    _tick.unsubscribe( hanldeTick );
                }
            }
            if( _tick ) {
                _tick.subscribe( handleTick );
            }
            
            this.update = function( delta ) {
                if( _active ) {
                    _delta = delta;
                    _time = _time + delta;
                }
            };
            
            var _active = true;
            this.suspend = function() {
                if( _active ) {
                    _active = false;
                    if( _tick ) {
                        _tick.unsubscribe( handleTick );
                    }
                }
            };
            
            this.resume = function() {
                if( !_active ) {
                    _active = true;
                    if( _tick ) {
                        _tick.subscribe( handleTick );
                    }
                }
            };
            
        };
        
        return Timer;
        
    }
    
});