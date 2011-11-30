/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    var Resource = require( '../resource' );

    // source : a dictionary containing component names and default properties
    var Template = function( source ) {

        source = source || {};

    };

    return new Resource({
        type: 'Template',
        object: Template
    });

});

