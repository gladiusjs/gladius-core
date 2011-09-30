/*jshint white: false, strict: false, plusplus: false, evil: true,
  onevar: false, nomen: false */
/*global requirejs: false, document: false, console: false, window: false,
  setTimeout: false */

/**
 * In the source case, use document.write to write out the require tag,
 * and load all moduels as distinct scripts for debugging. After a build,
 * all the modules are inlined, so will not use the document.write path.
 * Use has() testing module, since the requirejs optimizer will convert
 * the has test to false, and minification will strip the false code
 * branch. http://requirejs.org/docs/optimization.html#hasjs
 */
(function () {
    // Stub for has function.
    function has() {
        return true;
    }

    if ( has( 'source-config' ) ) {
        // Get the location of the gladius source.
        // The last script tag should be the gladius source
        // tag since in dev, it will be a blocking script tag,
        // so latest tag is the one for this script.
        var scripts = document.getElementsByTagName( 'script' ),
        path = scripts[scripts.length - 1].src;
        path = path.split( '/' );
        path.pop();
        path = path.join( '/' ) + '/';

        document.write( '<script src="' + path + '../external/require.js"></' + 'script>' );

        // Set up paths to find scripts.
        document.write('<script>requirejs.config( { baseUrl: "' + path + '",' +
                'paths: {' +
                // Paths are relative to baseUrl
                '  "external": "../external"' + 
                //'  "CubicVR.js": "../external/CubicVR.js"' +
                '}' +
                '} );' +
                'requirejs(["gladius-src"])</' + 'script>');
    }

    var gladius = this.gladius || ( this.gladius = {} );

    if ( !gladius.create ) {
        gladius.create = function () {
            // Hold on to callback, code in gladius-src will call it.
            ( gladius._waitingCreates ||
                    ( gladius._waitingCreates = [] ) ).push( arguments );
        };
    }
}());
