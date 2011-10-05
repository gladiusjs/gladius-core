/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    return function( engine ) {

        var Logic = function( options ) {

            option = options || {};

            var defaultNamespace = {
                engine: engine,
                script: function(){},
                log: function( testMessage ) {
                    console.log( testMessage );
                }
            };

            var script = options.script,
                scriptFunction,
                updateFunction,
                namespaceVarKeys = Object.keys( defaultNamespace),
                namespaceVarNames = namespaceVarKeys.join( "," ),
                namespaceVars = [];

            for( var i=0, l=namespaceVarKeys.length; i<l; ++i ) {
                namespaceVars.push( defaultNamespace[ namespaceVarKeys[ i ] ] );
            }

            if( script && script.nodeName === "SCRIPT" ) {
              script = script.innerHTML;
            }

            if( script ) {
                scriptFunction = new Function( namespaceVarNames, script );
            }

            this.start = function() {
                if( scriptFunction ) {
                    scriptFunction.apply( scriptFunction, namespaceVars );
                    updateFunction = defaultNamespace.script.update;
                } //if
            }; //start

            this.update = function() {
                if ( updateFunction ) {
                    updateFunction();
                }
            }; //update

            Object.defineProperty( this, "script", {
                get: function() { return scriptFunction; }
            });
            Object.defineProperty( this, "updateFunction", {
                get: function() { return updateFunction; },
                set: function( val ) {
                  updateFunction = val;
                }
            });
            Object.defineProperty( this, "namespace", {
                get: function() { return defaultNamespace; }
            });
        };
        Logic.prototype = new engine.core.Component({
            type: 'Logic'
        });
        Logic.prototype.constructor = Logic;
        
        return Logic;
        
    };

});
