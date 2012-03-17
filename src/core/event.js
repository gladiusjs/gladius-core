/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    var lang = require( 'lang' );

    var Event = function( options ) {

        options = options || {};
        var that = this;        

        if( undefined === options.type ) {
            throw 'event type is undefined';
        }
        Object.defineProperty( this, 'type', {
            get: function() {
                return options.type;
            }
        });
        
        var _queue = options.hasOwnProperty( 'queue' ) ? options.queue : true;
        Object.defineProperty( this, 'queue', {
            get: function() {
                return _queue;
            }
        });
        
        var _propagate = options.hasOwnProperty( 'propagate' ) ? options.propagate : false;
        Object.defineProperty( this, 'propagate', {
            get: function() {
                return _propagate;
            }
        });
        
        var _data = options.data || {};
        Object.defineProperty( this, 'data', {
            get: function() {
                return _data;
            }
        });
        
        // Send this event to each entity in targets
        // TD: needs semantics to exclude originator {component,entity} from delivery
        this.dispatch = function( targets ) {
            if( Array.isArray( targets ) ) {
                for( var i = 0, l = targets.length; i < l; ++ i ) {
                    try{
                        targets[i].handleEvent( that );
                    } catch( e ) {
                        console.log( e );
                        debugger;
                    }
                }
            } else {
                try{
                    targets.handleEvent( that );
                } catch( e ) {
                    console.log( e );
                    debugger;
                }
            }
        };

    };

    return Event;

});