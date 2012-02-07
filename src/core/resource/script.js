/*jshint white: false, strict: false, plusplus: false, onevar: false,
 nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define(function(require) {

    return function( engine ) {

        var Script = new engine.base.Resource({
            type : 'Script'
        }, function(data) {

            /*jslint evil:true */
            var _script = new Function(['engine', 'parameters'], 'var f = ' + data + '; return f.apply( null, parameters );');

            this.run = function() {
                return _script.apply(null, [engine, Array.prototype.slice.call(arguments)] );
            };
        });
        return Script;

    };

});
