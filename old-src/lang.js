/*jshint white: false, strict: false, plusplus: false */
/*global define: false */

//JS language helpers.

//Array Remove - By John Resig (MIT Licensed)
//Done outside the define call since it should be immediately
//before dependency tracing is done for any module.
if ( !Array.prototype.remove ) {
    Array.prototype.remove = function(from, to) {
        var rest = this.slice( (to || from) + 1 || this.length );
        this.length = from < 0 ? this.length + from : from;
        return this.push.apply(this, rest);
    };
}

if( !window.URL ) {
    if( window.webkitURL ) {
        window.URL = window.webkitURL;
    }
}

if( !window.BlobBuilder ) {
    if( window.MozBlobBuilder ) {
        window.BlobBuilder = window.MozBlobBuilder;
    } else if( window.WebKitBlobBuilder ) {
        window.BlobBuilder = window.WebKitBlobBuilder;
    } else {
        console.log( 'BlobBuilder is not supported' );
    }
}

if( !window.requestAnimationFrame ) {
    window.requestAnimationFrame = window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
        window.setTimeout(callback, 1000/60);
    };
}

define( function ( require ) {

    var extensions = {

            /* Abacus.guid()
             * [Source http://www.broofa.com/2008/09/javascript-uuid-function/]
             * Returns RFC 4122-compliant UUID
             */
            guid: function() {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                    return v.toString(16);
                }).toUpperCase();
            },

            assert: function( condition, message ) {
                if( !condition )
                    throw 'assertion failed: ' + message;
            },

            // Simple bind function to maintain "this" for a function.
            bind: function bind( obj, func ) {
                return function() {
                    return func.apply( obj, arguments );
                };
            },

            extend: function extend( object, extra ) {
                for ( var prop in extra ) {                
                    if ( !object.hasOwnProperty( prop ) && extra.hasOwnProperty( prop ) ) {
                        object[prop] = extra[prop];
                    } //if
                } //for
                return object;
            }, //extend

            clone: function clone( object ) {
                var copy = {};
                extensions.extend( copy, object );
                return copy;
            },

            isCallable: function( v ) {
                return typeof v === 'function';
            },

            getProperty: function( object, path ) {
                var current = path.shift();

                if( !object.hasOwnProperty( current ) ) {
                    throw 'property not found';
                } else {
                    if( 0 === path.length ) {
                        return object[current];
                    } else {
                        return extensions.getProperty( object[current], path );
                    }
                }
            },

            decodeDataURI: function(uri) {
                var components = uri.match( ':.*,' )[0].slice(1, -1).split(';');
                var contentType = components[0], encoding = components[1], base64 = components[2];
                var data = decodeURIComponent(uri.match( ',.*' )[0].slice(1));

                switch( contentType ) {
                case '':
                case 'text/plain':
                    return data;
                default:
                    throw 'unknown content type: ' + contentType;
                }
            },

            decodeJavaScriptURI: function( uri ) {
              /*jshint scripturl:true*/
                var js = uri.match( '^javascript://.*' )[0].slice( 'javascript://'.length );
                return decodeURIComponent( js );
            },

            getURLParams: function ( url ) {
                var urlParts = url.split("?");
                var result = {};
                if( urlParts[1] ) {
                    var params = urlParts[1].split("&");

                    for ( var i = 0; i < params.length; ++i ) {
                        var item = params[i].split("=");
                        var key = decodeURIComponent(item[0]);
                        var val = decodeURIComponent(item[1]);
                        result[key] = val;
                    }
                }

                return result;
            },
            
            createTestKbdEvent: function langCreateTestKbdEvent(type,
              canBubble, cancelable, view, charArg, key, location,
              modifiersList, repeat, locale ) {
                
              var e = document.createEvent("KeyboardEvent");

              // DOM3 API implementors (currently WebKit, IE, ...)
              if ( "initKeyboardEvent" in e ) {
                e.initKeyboardEvent( type, canBubble, cancelable, view,
                  charArg, key, location, modifiersList, repeat, locale );
              // Gecko browsers
              } else if ( "initKeyEvent" in e ) {
                e.initKeyEvent( type, canBubble, cancelable, view, false,
                  false, false, false, key.charCodeAt(0),
                  charArg.charCodeAt(0));
              } else {
                throw new Error("This browser's KeyboardEvent supports " +
                                "neither initKeyEvent nor initKeyboardEvent");
              }
              
              return e;
            }
    };

    return extensions;

});
