/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    return function( engine ) {
        
        var math = engine.math;
        var Component = require( '../component' );
        var Event = require( '../event' );

        var thisType = 'Transform';

        var Transform = function( options ) {

            option = options || {};
            var that = this;

            var _position = math.vector3.zero;        
            var _rotation = math.vector3.zero;
            var _scale = math.vector3.one;
            var _absolute = null;
            var _relative = null;

            var _cache = math.Matrix4();
            var _cached = false;
            var _recompile = true;

            var matrix = function() {
                if( _cached ) {
                    return _cache;
                } else {
                    math.transform.fixed( _position, _rotation, _scale, _cache );
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
                    if( _recompile ) {
                        if( this.owner.parent && this.owner.parent.contains( thisType ) ) {
                            var parentTransform = this.owner.parent.find( thisType );
                            math.matrix4.multiply( parentTransform.absolute, matrix(), _absolute );
                        } else {
                            _absolute = matrix();
                        }
                        _recompile = false;
                    }
                    return math.Matrix4( _absolute );   // TD: math.matrix4.copy( _absolute )
                }
            });
            
            Object.defineProperty( this, 'relative', {
                get: function() {
                }
            });

            // Event handlers

            var handleOwnerChanged = function( options ) {
                if( options.previous ) {
                    options.previous.parentChanged.unbind( handleOwnerParentChanged );
                }

                handleOwnerParentChanged({
                    previous: options.previous ? options.previous.parent : null,
                    new: options.new ? options.new.parent : null
                });

                if( options.new ) {
                    options.new.parentChanged.bind( handleOwnerParentChanged );
                    if( options.new.parent ) {
                    }
                }                

                _recompile = true;
            };

            var handleOwnerParentChanged = function( options ) {
                if( options.previous ) {
                    options.previous.componentAdded.unbind( handleOwnerParentComponentAdded );
                    options.previous.componentRemoved.unbind( handleOwnerParentComponentRemoved );
                    if( options.previous.contains( thisType ) ) {
                        options.previous.find( thisType ).transformChanged.unbind( handleParentTransformChanged );
                    }
                }

                if( options.new ) {
                    options.new.componentAdded.bind( handleOwnerParentComponentAdded );
                    options.new.componentRemoved.bind( handleOwnerParentComponentRemoved );
                    if( options.new.contains( thisType ) ) {
                        options.new.find( thisType ).transformChanged.bind( handleParentTransformChanged );
                    }
                }

                _recompile = true;
            };

            var handleOwnerParentComponentAdded = function( component ) {
                // NB: This assumes that the owner parent has at most one transform component at any time
                if( component.type === thisType ) {
                    component.transformChanged.bind( handleTransformChanged );
                }
            };

            var handleOwnerParentComponentRemoved = function( component ) {
                // NB: This assumes that the owner parent has at most one transform component at any time
                if( component.type === thisType ) {
                    component.transformChanged.unbind( handleTransformChanged );
                }
            };

            var handleOwnerParentTransformChanged = function( options ) {
                _recompile = true;
            };
            
            // Events

            var _transformChanged = new Event();
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

            this.ownerChanged.bind( handleOwnerChanged );

        };
        Transform.prototype = new Component({
            type: thisType
        });
        Transform.prototype.constructor = Transform;
        
        return Transform;
        
    };

});
