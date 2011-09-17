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

define( function ( require ) {

    return {
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
        } //extend
    };
});
