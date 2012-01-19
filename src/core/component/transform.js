/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    return function( engine ) {

        var math = engine.math;
        var Component = require( 'base/component' );
        var Delegate = require( 'common/delegate' );

        return Component({
            type: 'Transform'
        },
        function( options ) {

            options = options || {};
            var that = this;
            var _position = options.position || math.vector3.zero;
            var _rotation = options.rotation || math.vector3.zero;
            var _scale = options.scale || math.vector3.one;
            var _absolute = null;
            var _relative = null;

            var _cache = math.matrix4.identity;
            var _cached = false;    // True if the cached version of our fixed transform is valid, false otherwise

            var matrix = function() {
                if( _cached ) {
                    return _cache;
                } else {
                    _cache = math.transform.fixed( _position, _rotation, _scale );   // TD: this should compute the result into the buffer instead of returning a new matrix
                    _cached = true;
                    return _cache;
                }
            };

            Object.defineProperty( this, 'position', {
                get: function() {
                    return math.Vector3( _position );
                },
                set: function( value ) {
                    if( !math.vector3.equal( value, _position ) ) {
                        _position = value;  // TD: math.vector3.copy( _position, value )
                        _cached = false;
                    }
                }
            });

            Object.defineProperty( this, 'rotation', {
                get: function() {
                    return math.Vector3( _rotation );
                },
                set: function( value ) {
                    if( !math.vector3.equal( value, _rotation ) ) {
                        _rotation = value;  // TD: math.vector3.copy( _rotation, value )
                        _cached = false;
                    }
                }
            });

            Object.defineProperty( this, 'scale', {
                get: function() {
                    return math.Vector3( _scale );
                },
                set: function( value ) {
                    if( !math.vector3.equal( value, _scale ) ) {
                        _scale = value;     // TD: math.vector3.copy( _scale, value )
                        _cached = false;
                    }
                }
            });

            Object.defineProperty( this, 'absolute', {
                get: function() {
                    if( this.owner.parent && this.owner.parent.contains( this.type ) ) {
                        var parentTransform = this.owner.parent.find( this.type );                            
                        // _absolute = math.matrix4.multiply( [parentTransform.absolute, matrix()] );
                        _absolute = math.matrix4.multiply( [matrix(), parentTransform.absolute] );
                    } else {
                        _absolute = matrix();
                    }
                    return math.Matrix4( _absolute );   // TD: math.matrix4.copy( _absolute )
                }
            });

            Object.defineProperty( this, 'relative', {
                get: function() {
                }
            });

            // Delegate handlers

            var handleOwnerChanged = function( options ) {
                if( options.previous ) {
                    options.previous.parentChanged.unbind( handleOwnerParentChanged );
                }

                handleOwnerParentChanged({
                    previous: options.previous ? options.previous.parent : null,
                            current: options.current ? options.current.parent : null
                });

                if( options.current ) {
                    options.current.parentChanged.bind( handleOwnerParentChanged );
                    if( options.current.parent ) {
                    }
                }                

                _recompile = true;
            };

            var handleOwnerParentChanged = function( options ) {
                if( options.previous ) {
                    options.previous.componentAdded.unbind( handleOwnerParentComponentAdded );
                    options.previous.componentRemoved.unbind( handleOwnerParentComponentRemoved );
                    if( options.previous.contains( this.type ) ) {
                        options.previous.find( this.type ).transformChanged.unbind( handleParentTransformChanged );
                    }
                }

                if( options.current ) {
                    options.current.componentAdded.bind( handleOwnerParentComponentAdded );
                    options.current.componentRemoved.bind( handleOwnerParentComponentRemoved );
                    if( options.current.contains( this.type ) ) {
                        options.current.find( this.type ).transformChanged.bind( handleParentTransformChanged );
                    }
                }

                _recompile = true;
            };

            var handleOwnerParentComponentAdded = function( component ) {
                // NB: This assumes that the owner parent has at most one transform component at any time
                if( component.type === this.type ) {
                    component.transformChanged.bind( handleTransformChanged );
                }
            };

            var handleOwnerParentComponentRemoved = function( component ) {
                // NB: This assumes that the owner parent has at most one transform component at any time
                if( component.type === this.type ) {
                    component.transformChanged.unbind( handleTransformChanged );
                }
            };

            var handleOwnerParentTransformChanged = function( options ) {
                _recompile = true;
            };

            // Delegates

            var _transformChanged = new Delegate();
            Object.defineProperty( this, 'transformChanged', {
                get: function() {
                    return _transformChanged;
                }
            });
            var onTransformChanged = function( options ) {
                if( _transformChanged ) {
                    _transformChanged( options );
                }
            };

            // Bind events

            this.ownerChanged.subscribe( handleOwnerChanged );

        });

    };

});
