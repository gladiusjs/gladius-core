/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    return function( options ) {
        return {
            type: "point",
            method: "dynamic",
            diffuse: [ 1, 1, 1 ],
            specular: [ 1, 1, 1 ],
            intensity: 10,
            distance: 10
        };
    };

});
