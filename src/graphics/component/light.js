/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

  return function( engine, service, context ) { 

    var math = engine.math;
    var Component = require( 'base/component' );
    var Delegate = require( 'common/delegate' );

    return Component({
      type: 'Light',
      depends: 'Transform'
    },
    function( options ) {

        options = options || {};
        var _that = this,
            _transform;

        var _cvr = {
            light: new context.Light({
                type: options.type || "point",
                method: options.method || "dynamic",
                intensity: options.intensity,
                diffuse: options.diffuse || [ 1, 1, 1 ],
                specular: options.specular || [ 1, 1, 1 ],
                position: [ 0, 0, 0 ],
                distance: options.distance
            })
        };

        Object.defineProperty( this, "_cvr", {
            get: function() {
                return _cvr;
            }
        });

        Object.defineProperties( this, {
            radius: {
                get: function() {
                    return _cvr.light.distance;
                },
                set: function( val ) {
                    _cvr.light.distance = val;
                }
            },
            intensity: {
                get: function() {
                    return _cvr.light.intensity;
                },
                set: function( val ) {
                    _cvr.light.intensity = val;
                }
            }
        });

        var handleOwnerChanged = function( e ){
            _transform = e.current.find( "Transform" );
        }; //ownerChangedHandler
        this.ownerChanged.subscribe( handleOwnerChanged );

        this.prepareForRender = function(){
            _cvr.light.position = _transform.absolute;
        }; //prepareForRender

    });

  };

});

