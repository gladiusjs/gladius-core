/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    var Task = function( options ) {
        
        options = options || {};
        options.schedule = options.schedule || true;

        this.COMPLETE = 0;

        var _manager = options.manager || null;
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

        if( options.schedule ) {
            this.resume();
        }

    };

    return Task;

});
