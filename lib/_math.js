/**
 * @license
 * Copyright (c) 2011, Mozilla Foundation
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 *
 *     Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 *     Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 *     Neither the name of the Mozilla Foundation nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

(function (root, factory) {

  if ( typeof exports === 'object' ) {
    // Node
    module.exports = factory();
  } else if ( typeof define === 'function' && define.amd ) {
    // AMD. Register as an anonymous module.
    define(factory);
  } else if ( !root._Math ) {
    // Browser globals
    root._Math = factory();
  }

}(this, function () {


/**
 * almond 0.0.3 Copyright (c) 2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
/*jslint strict: false, plusplus: false */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {

    var defined = {},
        waiting = {},
        aps = [].slice,
        main, req;

    if (typeof define === "function") {
        //If a define is already in play via another AMD loader,
        //do not overwrite.
        return;
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseName = baseName.split("/");
                baseName = baseName.slice(0, baseName.length - 1);

                name = baseName.concat(name.split("/"));

                //start trimDots
                var i, part;
                for (i = 0; (part = name[i]); i++) {
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            }
        }
        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (waiting.hasOwnProperty(name)) {
            var args = waiting[name];
            delete waiting[name];
            main.apply(undef, args);
        }
        return defined[name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    function makeMap(name, relName) {
        var prefix, plugin,
            index = name.indexOf('!');

        if (index !== -1) {
            prefix = normalize(name.slice(0, index), relName);
            name = name.slice(index + 1);
            plugin = callDep(prefix);

            //Normalize according
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            p: plugin
        };
    }

    main = function (name, deps, callback, relName) {
        var args = [],
            usingExports,
            cjsModule, depName, i, ret, map;

        //Use name if no relName
        if (!relName) {
            relName = name;
        }

        //Call the callback to define the module, if necessary.
        if (typeof callback === 'function') {

            //Default to require, exports, module if no deps if
            //the factory arg has any arguments specified.
            if (!deps.length && callback.length) {
                deps = ['require', 'exports', 'module'];
            }

            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            for (i = 0; i < deps.length; i++) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = makeRequire(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = defined[name] = {};
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = {
                        id: name,
                        uri: '',
                        exports: defined[name]
                    };
                } else if (defined.hasOwnProperty(depName) || waiting.hasOwnProperty(depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw name + ' missing ' + depName;
                }
            }

            ret = callback.apply(defined[name], args);

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef) {
                    defined[name] = cjsModule.exports;
                } else if (!usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = req = function (deps, callback, relName, forceSync) {
        if (typeof deps === "string") {

            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            //Drop the config stuff on the ground.
            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = arguments[2];
            } else {
                deps = [];
            }
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 15);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function () {
        return req;
    };

    /**
     * Export require as a global, but only if it does not already exist.
     */
    if (!require) {
        require = req;
    }

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (define.unordered) {
            waiting[name] = [name, deps, callback];
        } else {
            main(name, deps, callback);
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("../tools/almond", function(){});

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

define('lang',['require'],function ( require ) {

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

/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define('constants',['require'],function ( require ) {

    return function() {
      
        var constants = {
                
                TAU: 2 * Math.PI,
                
                PI: Math.PI,
                
                HALF_PI: Math.PI / 2.0
                
        };
        
        return constants;
        
    };
    
});
/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define('vector/vector',['require'],function ( require ) {

    return function( FLOAT_ARRAY_TYPE ) {

        var Vector = function( dim, args ) {

            var elements = null;
            if( 1 === args.length ) {
                elements = args[0];
            } else {
                elements = args;
            }

            var vector = new FLOAT_ARRAY_TYPE( dim );
            for( var i = 0; i < dim; ++ i ) {
                vector[i] = elements[i];
            }

            return vector;

        };

        var vector = {
                
                $: Vector,

                add: function( v1, v2, result ) {
                    for( var i = 0; i < v1.length; ++ i ) {
                        result[i] += v1[i] + v2[i];
                    }

                    return result;
                },

                clear: function( v ) {
                    for( var i = 0; i < v.length; ++ i ) {
                        v[i] = 0;
                    }
                },

                dot: function( v1, v2 ) {
                    var res = 0;
                    for( var i = 0; i < v1.length; ++ i) {
                        res += v1[i] * v2[i];
                    }
                    return res;
                },

                equal: function( v1, v2, e ) {
                    e = e || 0.000001;

                    if( v1.length != v2.length ) {
                        return false;
                    }

                    var dim = v1.length;
                    for( var i = 0; i < dim; ++ i ) {
                        if ( Math.abs(v1[i] - v2[i]) > e ) {
                            return false;
                        }
                    }

                    return true;
                },

                length: function( v ) {
                    var va = 0;
                    for( var i = 0; i < v.length; ++ i ) {
                        va += v[i] * v[i];
                    }

                    return Math.sqrt(va);
                },

                multiply: function( v, s, result ) {
                    for( var i = 0; i < v.length; ++ i ) {
                        result[i] = v[i] * s;
                    }

                    return result;
                },
                
                negate: function( v, result ) {
                    for( var i = 0; i < v.length; ++ i ) {
                        result[i] = v[i] * -1;
                    }
                    
                    return result;
                },

                normalize: function( v, result ) {
                    var len = v.length;
                    for( var i = 0, abslen = vector.length(v); i < len; ++ i ) {
                        result[i] = v[i] / abslen;
                    }

                    return result;
                },

                subtract: function( v1, v2, result) {
                    for( var i = 0; i < v1.length; ++ i ) {
                        result[i] = v1[i] - v2[i];
                    }

                    return result;
                }        

        };
        
        Object.defineProperty( vector, 'x', {
            get: function() {
                return Vector2( [1, 0] );
            },
            enumerable: true
        });

        Object.defineProperty( vector, 'u', {
            get: function() {
                return Vector2( [1, 0] );
            },
            enumerable: true
        });

        Object.defineProperty( vector, 'y', {
            get: function() {
                return Vector2( [0, 1] );
            },
            enumerable: true
        });

        Object.defineProperty( vector, 'v', {
            get: function() {
                return Vector2( [0, 1] );
            },
            enumerable: true
        });

        Object.defineProperty( vector, 'zero', {
            get: function() {
                return Vector2( [0, 0] );
            },
            enumerable: true
        });

        Object.defineProperty( vector, 'one', {
            get: function() {
                return Vector2( [1, 1] );
            },
            enumerable: true
        });

        return vector;

    };

});
/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define('vector/vector2',['require','./vector','../constants'],function ( require ) {

    return function( FLOAT_ARRAY_TYPE ) {

        var vector = require( './vector' )( FLOAT_ARRAY_TYPE );
        var constants = require( '../constants' )();

        var Vector2 = function() {
            if( 0 === arguments.length ) {
                return vector.$( 2, [0, 0] );
            } else {
                return vector.$( 2, arguments );
            }
        };
        
        var vector2 = {
                
                $: Vector2,
          
                add: function( v1, v2, result ) {
                    result = result || Vector2();

                    return vector.add( v1, v2, result );
                },

                angle: function( v1, v2 ) {
                    var nV1 = Vector2();
                    var nV2 = Vector2();

                    vector.normalize(v1, nV1);
                    vector.normalize(v2, nV2);

                    return Math.acos( vector.dot( nV1, nV2 ) );
                },

                clear: vector.clear,

                dot: vector.dot,

                equal: vector.equal,

                length: vector.length,

                multiply: function( v, s, result ) {
                    result = result || Vector2();

                    return vector.multiply( v, s, result );
                },
                
                negate: function( v, result ) {
                    result = result || Vector2();
                    
                    return vector.negate( v, result );
                },

                normalize: function( v, result ) {
                    result = result || Vector2();
                    var len = vector.length(v);

                    result[0] = v[0]/len;
                    result[1] = v[1]/len;

                    return result;
                },
                
                project: function( v1, v2, result ) {
                    result = result || Vector2();
                    
                    var dp = v1[0]*v2[0] + v1[1]*v2[1];
                    var dp_over_v2_squared_length = dp / (v2[0]*v2[0] + v2[1]*v2[1]);

                    result[0] = dp_over_v2_squared_length * v2[0];
                    result[1] = dp_over_v2_squared_length * v2[1];
                    
                    return result;
                },
                
                set: function( v, x, y ) {
                    v[0] = x;
                    v[1] = y;
                },
                
                subtract: function( v1, v2, result ) {
                    result = result || Vector2();

                    return vector.subtract( v1, v2, result );
                }
                
        };
        
        Object.defineProperty( vector2, 'x', {
            get: function() {
                return Vector2( [1, 0] );
            },
            enumerable: true
        });

        Object.defineProperty( vector2, 'u', {
            get: function() {
                return Vector2( [1, 0] );
            },
            enumerable: true
        });

        Object.defineProperty( vector2, 'y', {
            get: function() {
                return Vector2( [0, 1] );
            },
            enumerable: true
        });

        Object.defineProperty( vector2, 'v', {
            get: function() {
                return Vector2( [0, 1] );
            },
            enumerable: true
        });

        Object.defineProperty( vector2, 'zero', {
            get: function() {
                return Vector2( [0, 0] );
            },
            enumerable: true
        });

        Object.defineProperty( vector2, 'one', {
            get: function() {
                return Vector2( [1, 1] );
            },
            enumerable: true
        });

        return vector2;

    };

});
/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define('vector/vector3',['require','./vector'],function ( require ) {

    return function( FLOAT_ARRAY_TYPE ) {

        var vector = require( './vector' )( FLOAT_ARRAY_TYPE );

        var Vector3 = function() {
            if( 0 === arguments.length ) {
                return vector.$( 3, [0, 0, 0] );
            } else {
                return vector.$( 3, arguments );
            }
        };

        var vector3 = {
                
                $: Vector3,

                add: function( v1, v2, result ) {
                    result = result || Vector3();

                    return vector.add( v1, v2, result );
                },

                angle: function( v1, v2 ) {

                    return Math.acos(
                            (v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2]) /
                            (Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1] + v1[2] * v1[2]) *
                                    Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1] + v2[2] * v2[2]))
                    );
                },

                clear: vector.clear,

                cross: function( v1, v2, result ) {
                    result = result || Vector3();

                    result[0] = (v1[1] * v2[2]) - (v2[1] * v1[2]);
                    result[1] = (v1[2] * v2[0]) - (v2[2] * v1[0]);
                    result[2] = (v1[0] * v2[1]) - (v2[0] * v1[1]);

                    return result;
                },

                dot: function( v1, v2 ) {
                    return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
                },

                equal: vector.equal,

                length: vector.length,

                multiply: function( v, s, result ) {
                    result = result || Vector3();

                    return vector.multiply( v, s, result );
                },

                normal: function( v1, v2, result ) {
                    result = result || Vector3();

                    return Vector3.cross( v1, v2, result );
                },

                normalize: function( v, result ) {
                    result = result || Vector3();
                    var len = vector.length(v);

                    result[0] = v[0]/len;
                    result[1] = v[1]/len;
                    result[2] = v[2]/len;

                    return result;
                },
                
                set: function( v, x, y, z ) {
                    v[0] = x;
                    v[1] = y;
                    v[2] = z;
                },

                subtract: function( v1, v2, result ) {
                    result = result || Vector3();

                    return vector.subtract( v1, v2, result );
                }

        };
        
        Object.defineProperty( vector3, 'x', {
            get: function() {
                return Vector3( [1, 0, 0] );
            },
            enumerable: true
        });

        Object.defineProperty( vector3, 'y', {
            get: function() {
                return Vector3( [0, 1, 0] );
            },
            enumerable: true
        });

        Object.defineProperty( vector3, 'z', {
            get: function() {
                return Vector3( [0, 0, 1] );
            },
            enumerable: true
        });

        Object.defineProperty( vector3, 'zero', {
            get: function() {
                return Vector3( [0, 0, 0] );
            },
            enumerable: true
        });

        Object.defineProperty( vector3, 'one', {
            get: function() {
                return Vector3( [1, 1, 1] );
            },
            enumerable: true
        });

        return vector3;

    };

});
/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define('vector/vector4',['require','./vector'],function ( require ) {

    return function( FLOAT_ARRAY_TYPE ) {

        var vector = require( './vector' )( FLOAT_ARRAY_TYPE );

        var Vector4 = function() {
            if( 0 === arguments.length ) {
                return vector.$( 4, [0, 0, 0, 0] );
            } else {
                return vector.$( 4, arguments );
            }
        };

        var vector4 = {
                
                $: Vector4,

                add: function( v1, v2, result ) {
                    result = result || Vector4();

                    result[0] = v1[0] + v2[0];
                    result[1] = v1[1] + v2[1];
                    result[2] = v1[2] + v2[2];
                    result[3] = v1[3] + v2[3];

                    return result;
                },

                // Computes the angle between v1 and v2
                angle: function( v1, v2 ) {
                    return Math.acos(
                            (v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2] + v1[3] * v2[3]) /
                            (Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1] + v1[2] * v1[2] + v1[3] * v1[3]) *
                                    Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1] + v2[2] * v2[2] + v2[3] * v2[3]))
                    );
                },

                clear: vector.clear,

                // Computes the dot product of v1 and v2
                dot: function( v1, v2 ) {
                    return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2] + v1[3] * v2[3];
                },

                equal: vector.equal,

                length: vector.length,

                // Computes v * s
                multiply: function( v, s, result ) {
                    result = result || Vector4();

                    return vector.multiply( v, s, result );
                },

                // Computes a Vector4 with same direction as v having unit length
                normalize: function( v, result ) {
                    result = result || Vector4();
                    var len = vector.length(v);

                    result[0] = v[0]/len;
                    result[1] = v[1]/len;
                    result[2] = v[2]/len;
                    result[3] = v[3]/len;

                    return result;
                },
                
                set: function( v, x, y, z, w ) {
                    v[0] = x;
                    v[1] = y;
                    v[2] = z;
                    v[3] = w;
                },

                // Computes v1 - v2
                subtract: function( v1, v2, result ) {
                    result = result || Vector4();

                    return vector.subtract( v1, v2, result );
                }

        }
        
        Object.defineProperty( vector4, 'x', {
            get: function() {
                return Vector4( [1, 0, 0, 0] );
            },
            enumerable: true
        });

        Object.defineProperty( vector4, 'y', {
            get: function() {
                return Vector4( [0, 1, 0, 0] );
            },
            enumerable: true
        });
        
        Object.defineProperty( vector4, 'z', {
            get: function() {
                return Vector4( [0, 0, 1, 0] );
            },
            enumerable: true
        });
        
        Object.defineProperty( vector4, 'w', {
            get: function() {
                return Vector4( [0, 0, 0, 1] );
            },
            enumerable: true
        });

        Object.defineProperty( vector4, 'zero', {
            get: function() {
                return Vector4( [0, 0, 0, 0] );
            },
            enumerable: true
        });

        Object.defineProperty( vector4, 'one', {
            get: function() {
                return Vector4( [1, 1, 1, 1] );
            },
            enumerable: true
        });

        return vector4;

    };

});
/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define('vector/quaternion',['require','./vector4','./vector3'],function ( require ) {

    return function( FLOAT_ARRAY_TYPE ) {

        var vector4 = require( './vector4' )( FLOAT_ARRAY_TYPE );
        var vector3 = require( './vector3' )( FLOAT_ARRAY_TYPE );

        var Quaternion = vector4.$;

        var quaternion = {

                $: Quaternion,

                to: {
                    rpy: function( q, result ) {
                        var r = result || vector3.$();
                        var atan2 = Math.atan2,
                            asin = Math.asin;

                        r[0] = atan2( 2*q[0]*q[1] + 2*q[2]*q[3], 1 - 2*q[1]*q[1] + 2*q[2]*q[2] );
                        r[1] = asin( 2*q[0]*q[2] - 2*q[3]*q[1] );
                        r[2] = atan2( 2*q[0]*q[3] + 2*q[1]*q[2], 1 - 2*q[2]*q[2] + 2*q[3]*q[3] );

                        if( !result ) {
                            return r;
                        }
                    }
                },

                from: {
                    rpy: function( v, result ) {
                        var r = result || quaternion.$();
                        var sin = Math.sin,
                            cos = Math.cos;
                        var half_phi = v[0] / 2,
                            half_theta = v[1] / 2,
                            half_psi = v[2] / 2;
                        var sin_half_phi = sin( half_phi ),
                            cos_half_phi = cos( half_phi ),
                            sin_half_theta = sin( half_theta ),
                            cos_half_theta = cos( half_theta ),
                            sin_half_psi = sin( half_psi ),
                            cos_half_psi = cos( half_psi );

                        r[0] = cos_half_phi * cos_half_theta * cos_half_psi + 
                               sin_half_phi * sin_half_theta * sin_half_psi;
                        r[1] = sin_half_phi * cos_half_theta * cos_half_psi -
                               cos_half_phi * sin_half_theta * sin_half_psi;
                        r[2] = cos_half_phi * sin_half_theta * cos_half_psi +
                               sin_half_phi * cos_half_theta * sin_half_psi;
                        r[3] = cos_half_phi * cos_half_theta * sin_half_psi -
                               sin_half_phi * sin_half_theta * cos_half_psi;

                        if( !result ) {
                            return r;
                        }
                    }
                },

                length: vector4.length,

                multiply: function( q1, q2, result ) {
                    var r = result || quaternion.$();

                    r[0] = q1[3] * q2[0] + q1[0] * q2[3] + q1[1] * q2[2] - q1[2] * q2[1];   // x
                    r[1] = q1[3] * q2[1] - q1[0] * q2[2] + q1[1] * q2[3] + q1[2] * q2[0];   // y
                    r[2] = q1[3] * q2[2] + q1[0] * q2[1] - q1[1] * q2[0] + q1[2] * q2[3];   // z
                    r[3] = q1[3] * q2[3] - q1[0] * q2[0] - q1[1] * q2[1] - q1[2] * q2[2];   // w

                    if( !result ) {
                        return r;
                    }
                },

                normalize: vector4.normalize

        };

        Object.defineProperty( quaternion, 'identity', {
            get: function() {
                return Quaternion( [0, 0, 0, 1] );
            },
            enumerable: true
        });

        return quaternion;

    };

});

/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define('matrix/matrix',['require'],function ( require ) {

    return function( FLOAT_ARRAY_TYPE ) {
      
        var Matrix = function( dim, args ) {
        
            var elements = null;
            if( 1 === args.length ) {
                elements = args[0];
            } else {
                elements = args;
            }
            
            var matrix = new FLOAT_ARRAY_TYPE( dim );
            for( var i = 0; i < dim; ++ i ) {
                matrix[i] = elements[i];
            }
            
            return matrix;
            
        };
        
        var matrix = {
                
            $: Matrix,
      
            add: function( m1, m2, result ) {
                for( var i = 0; i < m1.length; ++ i ) {
                    result[i] += m1[i] + m2[i];
                }

                return result;
            },
            
            subtract: function( m1, m2, result ) {
                for( var i = 0; i < m1.length; ++ i ) {
                    m1[i] -= m2[i];
                }
                return m1;
            },
            
            clear: function( m ) {
                for( var i = 0; i < m.length; ++ i ) {
                    m[i] = 0;
                }
            },
            
            equal: function( m1, m2, e ) {
                e = e || 0.000001;

                if( m1.length != m2.length ) {
                    return false;
                }
                
                var dim = m1.length;
                for( var i = 0; i < dim; ++ i ) {
                    if( Math.abs( m1[i] - m2[i] ) > e ) {
                        return false;
                    }
                }

                return true;
            }
                
        };
        
        return matrix;
        
    };
    
});

/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define('matrix/matrix2',['require','./matrix'],function ( require ) {

    return function( FLOAT_ARRAY_TYPE ) {

        var matrix = require( './matrix' )( FLOAT_ARRAY_TYPE );

        var Matrix2 = function() {
            if( 0 === arguments.length ) {
                return matrix.$( 4, [0, 0,
                                     0, 0] );
            } else {
                return matrix.$( 4, arguments );
            }
        };

        var matrix2 = {

            $: Matrix2,

            add: function( ml, result ) {
                result = result || Matrix2();
                var temp = ml[0];
                
                if (ml.length == 1)
                    result = temp;
                else {
                    for (var i = 1; i < ml.length; ++ i) {
                        result = matrix.add(temp, ml[i], result);
                        temp = result;
                    }
                }
                return result;
            },

            subtract: function( ml, result ) {
                result = result || Matrix2();
                var temp = ml[0];
                
                if (ml.length == 1) {
                    result = temp;
                } else {
                    var temp = ml[0];
                    for (var i = 1; i < ml.length; ++ i) {
                        result = matrix.subtract(temp, ml[i], result);
                        temp = result;
                    }
                }
                return result;
            },

            clear: matrix.clear,

            equal: matrix.equal,

            determinant: function( m ) {
                return m[0]*m[3] - m[1]*m[2];
            },
            
            inverse: function( m, result ) {
            
                var det = matrix2.determinant(m);
                if (det == 0)
                    throw 'matrix is singular';
                
                result = result || Matrix2();
                
                result[0] = m[3]/det;
                result[1] = m[1]*-1/det;
                result[2] = m[2]*-1/det;
                result[3] = m[0]/det;
                
                return result;
            },
            
            multiply: function( ml, result ) {
                result = result || Matrix2();
                
                if (ml.length == 1)
                    return ml[0];
                else {

                    var temp = ml[0];
                    for (var i = 1; i < ml.length; ++ i) {
                        result[0] = temp[0]*ml[i][0] + temp[1]*ml[i][2];
                        result[1] = temp[0]*ml[i][1] + temp[1]*ml[i][3];
                        result[2] = temp[2]*ml[i][0] + temp[3]*ml[i][2];
                        result[3] = temp[2]*ml[i][1] + temp[3]*ml[i][3];
                        temp = result;
                    }
                }
                return result;
            },
            
            transpose: function( m, result ) {
                result = result || Matrix2();
                
                var temp = m[1];
                result[0] = m[0];
                result[1] = m[2];
                result[2] = temp;
                result[3] = m[3];
                
                return result;
            }
        }

        Object.defineProperty( matrix2, 'zero', {
            get: function() {
                return Matrix2( [0, 0,
                                 0, 0] );
            },
            enumerable: true
        });
        
        Object.defineProperty( matrix2, 'one', {
            get: function() {
                return Matrix2( [1, 1,
                                 1, 1] );
            },
            enumerable: true
        });
        
        Object.defineProperty( matrix2, 'identity', {
            get: function() {
                return Matrix2( [1, 0,
                                 0, 1] );
            },
            enumerable: true
        });

        return matrix2;

    };

});
/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define('matrix/matrix3',['require','./matrix'],function ( require ) {

    return function( FLOAT_ARRAY_TYPE ) {

        var matrix = require( './matrix' )( FLOAT_ARRAY_TYPE );

        var Matrix3 = function() {
            if( 0 === arguments.length ) {
                return matrix.$( 9, [0, 0, 0,
                                     0, 0, 0,
                                     0, 0, 0] );
            } else {
                return matrix.$( 9, arguments );
            }
        };

        var matrix3 = {
                
            $: Matrix3,

            add: function( ml, result ) {
                result = result || Matrix3();
                
                if (ml.length == 1) {
                    return ml[0];
                } else {
                    var temp = ml[0];
                    for (var i = 1; i < ml.length; ++ i) {
                        result = matrix.add(temp, ml[i], result);
                        temp = result;
                    }
                }
                return result;
            },

            subtract: function( ml, result ) {
                result = result || Matrix3();
                var temp = ml[0];
                
                if (ml.length == 1)
                    result = temp;
                else {
                    for (var i = 1; i < ml.length; ++ i) {
                        result = matrix.subtract(temp, ml[i], result);
                        temp = result;
                    }
                }
                return result;
            },

            clear: matrix.clear,

            equal: matrix.equal,

            determinant: function( m ) {

                return m[0]*(m[4]*m[8] - m[5]*m[7]) 
                       - m[1]*(m[3]*m[8] - m[5]*m[6]) 
                       + m[2]*(m[3]*m[7] - m[4]*m[6]);
            },
            
            inverse: function( m, result ) {
                var det = matrix3.determinant(m);
                if (det == 0)
                    throw 'matrix is singular';
                
                result = result || Matrix3();
                
                result[0] = (m[8]*m[4] - m[7]*m[5])/det;
                result[1] = -(m[8]*m[1] - m[7]*[2])/det;
                result[2] = (m[5]*m[1] - m[4]*m[2])/det;
                
                result[3] = -(m[8]*m[3] - m[6]*m[5])/det;
                result[4] = (m[8]*m[0] - m[6]*m[2])/det;
                result[5] = -(m[5]*m[0] - m[3]*m[2])/det;
                
                result[6] = (m[7]*m[3] - m[6]*m[4])/det;
                result[7] = -(m[7]*m[0] - m[6]*m[1])/det;
                result[8] = (m[4]*m[0] - m[3]*m[1])/det;

                return result;
            },
            
            multiply: function( ml, result ) {
                result = result || Matrix3();
                
                if (ml.length == 1)
                    return ml[0];
                else {

                    var temp = ml[0];
                    for (var i = 1; i < ml.length; ++ i) {

                        result[0] = temp[0]*ml[i][0] + temp[1]*ml[i][3] + temp[2]*ml[i][6];
                        result[1] = temp[0]*ml[i][1] + temp[1]*ml[i][4] + temp[2]*ml[i][7];
                        result[2] = temp[0]*ml[i][2] + temp[1]*ml[i][5] + temp[2]*ml[i][8];

                        result[3] = temp[3]*ml[i][0] + temp[4]*ml[i][3] + temp[5]*ml[i][6];
                        result[4] = temp[3]*ml[i][1] + temp[4]*ml[i][4] + temp[5]*ml[i][7];
                        result[5] = temp[3]*ml[i][2] + temp[4]*ml[i][5] + temp[5]*ml[i][8];

                        result[6] = temp[6]*ml[i][0] + temp[7]*ml[i][3] + temp[8]*ml[i][6];
                        result[7] = temp[6]*ml[i][1] + temp[7]*ml[i][4] + temp[8]*ml[i][7];
                        result[8] = temp[6]*ml[i][2] + temp[7]*ml[i][5] + temp[8]*ml[i][8];
                        
                        temp = result;
                    }
                }
                return result;
            },
            
            // Convert a vector rotation (in radians) to a 3x3 matrix
            rotate: function( v, result ) {
                var r = result || matrix4.identity;

                var sinA,
                    cosA;

                var ml;
                if( 0 !== v[2] ) {
                    sinA = Math.sin( v[2] );
                    cosA = Math.cos( v[2] );
                    ml = [];
                    ml.push(matrix3.$([ cosA, sinA, 0,
                                       -sinA, cosA, 0,
                                        0, 0, 1 ] ));
                    ml.push(matrix3.$(r));
                    
                    matrix3.multiply( ml, r );
                }

                if( 0 !== v[1] ) {
                    sinA = Math.sin( v[1] );
                    cosA = Math.cos( v[1] );
                    ml = [];
                    ml.push(matrix3.$([ cosA, 0, -sinA,
                                        0, 1, 0,
                                        sinA, 0, cosA ] ));
                    ml.push(matrix3.$(r));
                    
                    matrix3.multiply( ml, r );
                }

                if( 0 !== v[0] ) {
                    sinA = Math.sin( v[0] );
                    cosA = Math.cos( v[0] );
                    ml = [];
                    ml.push(matrix3.$([ 1, 0, 0,
                                        0, cosA, sinA,
                                        0, -sinA, cosA ] ));
                    ml.push(matrix3.$(r));
                    
                    matrix3.multiply( ml, r );
                }

                if( !result ) {
                    return r;
                }
            },

            transpose: function( m, result ) {
                result = result || Matrix3();

                var a01 = m[1], a02 = m[2], a12 = m[5];
                
                result[0] = m[0];
                result[1] = m[3];
                result[2] = m[6];
                result[3] = a01;
                result[4] = m[4];
                result[5] = m[7];
                result[6] = a02;
                result[7] = a12;
                result[8] = m[8];

                return result;
            }

        };
        
        Object.defineProperty( matrix3, 'zero', {
            get: function() {
                return Matrix3( [0, 0, 0,
                                 0, 0, 0,
                                 0, 0, 0] );
            },
            enumerable: true
        });
        
        Object.defineProperty( matrix3, 'one', {
            get: function() {
                return Matrix3( [1, 1, 1,
                                 1, 1, 1,
                                 1, 1, 1] );
            },
            enumerable: true
        });
        
        Object.defineProperty( matrix3, 'identity', {
            get: function() {
                return Matrix3( [1, 0, 0,
                                 0, 1, 0,
                                 0, 0, 1] );
            },
            enumerable: true
        });

        return matrix3;

    };

});
/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define('matrix/matrix4',['require','./matrix','../vector/vector3'],function ( require ) {

    return function( FLOAT_ARRAY_TYPE ) {

        var matrix = require( './matrix' )( FLOAT_ARRAY_TYPE );
        var vector3 = require( '../vector/vector3' )( FLOAT_ARRAY_TYPE );

        var Matrix4 = function() {
            if( 0 === arguments.length ) {
                return matrix.$( 16, [0, 0, 0, 0,
                                      0, 0, 0, 0,
                                      0, 0, 0, 0,
                                      0, 0, 0, 0] );
            } else {
                return matrix.$( 16, arguments );
            }
        };

        var matrix4 = {
                
            $: Matrix4,

            add: function( ml, result ) {
                result = result || Matrix4();
                
                if (ml.length == 1) {
                    return ml[0];
                } else {
                    var temp = ml[0];
                    for (var i = 1; i < ml.length; ++ i) {
                        result = matrix.add(temp, ml[i], result);
                        temp = result;
                    }
                }
                return result;
            },
            
            subtract: function( ml, result ) {
                result = result || Matrix4();
                var temp = ml[0];
                
                if (ml.length == 1)
                    result = temp;
                else {
                    for (var i = 1; i < ml.length; ++ i) {
                        result = matrix.subtract(temp, ml[i], result);
                        temp = result;
                    }
                }
                return result;
            },

            clear: matrix.clear,

            equal: matrix.equal,

            multiply: function( ml, result ) {
                result = result || Matrix4();
                
                if (ml.length == 1)
                    return ml[0];
                else {

                    var temp = ml[0];
                    for (var i = 1; i < ml.length; ++ i) {

                        result[0] = temp[0]*ml[i][0] + temp[1]*ml[i][4] + temp[2]*ml[i][8] + temp[3]*ml[i][12];
                        result[1] = temp[0]*ml[i][1] + temp[1]*ml[i][5] + temp[2]*ml[i][9] + temp[3]*ml[i][13];
                        result[2] = temp[0]*ml[i][2] + temp[1]*ml[i][6] + temp[2]*ml[i][10] + temp[3]*ml[i][14];
                        result[3] = temp[0]*ml[i][3] + temp[1]*ml[i][7] + temp[2]*ml[i][11] + temp[3]*ml[i][15];            
                        result[4] = temp[4]*ml[i][0] + temp[5]*ml[i][4] + temp[6]*ml[i][8] + temp[7]*ml[i][12];
                        result[5] = temp[4]*ml[i][1] + temp[5]*ml[i][5] + temp[6]*ml[i][9] + temp[7]*ml[i][13];
                        result[6] = temp[4]*ml[i][2] + temp[5]*ml[i][6] + temp[6]*ml[i][10] + temp[7]*ml[i][14];
                        result[7] = temp[4]*ml[i][3] + temp[5]*ml[i][7] + temp[6]*ml[i][11] + temp[7]*ml[i][15];
                        result[8] = temp[8]*ml[i][0] + temp[9]*ml[i][4] + temp[10]*ml[i][8] + temp[11]*ml[i][12];
                        result[9] = temp[8]*ml[i][1] + temp[9]*ml[i][5] + temp[10]*ml[i][9] + temp[11]*ml[i][13];
                        result[10] = temp[8]*ml[i][2] + temp[9]*ml[i][6] + temp[10]*ml[i][10] + temp[11]*ml[i][14];
                        result[11] = temp[8]*ml[i][3] + temp[9]*ml[i][7] + temp[10]*ml[i][11] + temp[11]*ml[i][15];
                        result[12] = temp[12]*ml[i][0] + temp[13]*ml[i][4] + temp[14]*ml[i][8] + temp[15]*ml[i][12];
                        result[13] = temp[12]*ml[i][1] + temp[13]*ml[i][5] + temp[14]*ml[i][9] + temp[15]*ml[i][13];
                        result[14] = temp[12]*ml[i][2] + temp[13]*ml[i][6] + temp[14]*ml[i][10] + temp[15]*ml[i][14];
                        result[15] = temp[12]*ml[i][3] + temp[13]*ml[i][7] + temp[14]*ml[i][11] + temp[15]*ml[i][15];                        
                        
                        temp = result;
                    }
                }
                return result;
            },
            
            multiplyVector3: function( m, v, result ) {
                result = result || vector3.$();
                
                result[0] = m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12];
                result[1] = m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13];
                result[2] = m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14];

                return result;
            },

            determinant: function (m) {
                var a0 = m[0] * m[5] - m[1] * m[4];
                var a1 = m[0] * m[6] - m[2] * m[4];
                var a2 = m[0] * m[7] - m[3] * m[4];
                var a3 = m[1] * m[6] - m[2] * m[5];
                var a4 = m[1] * m[7] - m[3] * m[5];
                var a5 = m[2] * m[7] - m[3] * m[6];
                var b0 = m[8] * m[13] - m[9] * m[12];
                var b1 = m[8] * m[14] - m[10] * m[12];
                var b2 = m[8] * m[15] - m[11] * m[12];
                var b3 = m[9] * m[14] - m[10] * m[13];
                var b4 = m[9] * m[15] - m[11] * m[13];
                var b5 = m[10] * m[15] - m[11] * m[14];

                var det = a0 * b5 - a1 * b4 + a2 * b3 + a3 * b2 - a4 * b1 + a5 * b0;

                return det;
            },

            transpose: function (m , result) {
                result = result || Matrix4();
                
                result[0] = m[0];
                result[1] = m[4];
                result[2] = m[8];
                result[3] = m[12];
                result[4] = m[1];
                result[5] = m[5]; 
                result[6] = m[9]; 
                result[7] = m[13]; 
                result[8] = m[2];
                result[9] = m[6]; 
                result[10] = m[10]; 
                result[11] = m[14]; 
                result[12] = m[3];
                result[13] = m[7]; 
                result[14] = m[11]; 
                result[15] = m[15];
                
                return result;
            },

            inverse: function (m, result) {
                
                result = result || Matrix4();
                
                var a00 = m[0], a01 = m[1], a02 = m[2], a03 = m[3],
                    a10 = m[4], a11 = m[5], a12 = m[6], a13 = m[7],
                    a20 = m[8], a21 = m[9], a22 = m[10], a23 = m[11],
                    a30 = m[12], a31 = m[13], a32 = m[14], a33 = m[15],

                    b00 = a00 * a11 - a01 * a10,
                    b01 = a00 * a12 - a02 * a10,
                    b02 = a00 * a13 - a03 * a10,
                    b03 = a01 * a12 - a02 * a11,
                    b04 = a01 * a13 - a03 * a11,
                    b05 = a02 * a13 - a03 * a12,
                    b06 = a20 * a31 - a21 * a30,
                    b07 = a20 * a32 - a22 * a30,
                    b08 = a20 * a33 - a23 * a30,
                    b09 = a21 * a32 - a22 * a31,
                    b10 = a21 * a33 - a23 * a31,
                    b11 = a22 * a33 - a23 * a32,

                    d = (b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06),
                    invDet;

                // Determinant, throw exception if singular
                if (!d)
                    throw 'matrix is singular';
                
                invDet = 1 / d;
                result[0] = (a11 * b11 - a12 * b10 + a13 * b09) * invDet;
                result[1] = (-a01 * b11 + a02 * b10 - a03 * b09) * invDet;
                result[2] = (a31 * b05 - a32 * b04 + a33 * b03) * invDet;
                result[3] = (-a21 * b05 + a22 * b04 - a23 * b03) * invDet;
                result[4] = (-a10 * b11 + a12 * b08 - a13 * b07) * invDet;
                result[5] = (a00 * b11 - a02 * b08 + a03 * b07) * invDet;
                result[6] = (-a30 * b05 + a32 * b02 - a33 * b01) * invDet;
                result[7] = (a20 * b05 - a22 * b02 + a23 * b01) * invDet;
                result[8] = (a10 * b10 - a11 * b08 + a13 * b06) * invDet;
                result[9] = (-a00 * b10 + a01 * b08 - a03 * b06) * invDet;
                result[10] = (a30 * b04 - a31 * b02 + a33 * b00) * invDet;
                result[11] = (-a20 * b04 + a21 * b02 - a23 * b00) * invDet;
                result[12] = (-a10 * b09 + a11 * b07 - a12 * b06) * invDet;
                result[13] = (a00 * b09 - a01 * b07 + a02 * b06) * invDet;
                result[14] = (-a30 * b03 + a31 * b01 - a32 * b00) * invDet;
                result[15] = (a20 * b03 - a21 * b01 + a22 * b00) * invDet;
                
                return result;
            },

            toHTML: function( m ) {
                var result = "[ ";
                for( var i = 0; i < 4; ++ i ) {
                    result += "<br>";
                    for( var j = 0; j < 4; ++ j ) {
                        result += " (" + m[4*i+j] + ") ";
                    }
                }
                result += " ]";
                return result;
            }

        };
        Object.defineProperty( matrix4, 'zero', {
            get: function() {
                return Matrix4( [0, 0, 0, 0,
                                 0, 0, 0, 0,
                                 0, 0, 0, 0,
                                 0, 0, 0, 0] );
            },
            enumerable: true
        });
        
        Object.defineProperty( matrix4, 'one', {
            get: function() {
                return Matrix4( [1, 1, 1, 1,
                                 1, 1, 1, 1,
                                 1, 1, 1, 1,
                                 1, 1, 1, 1] );
            },
            enumerable: true
        });
        
        Object.defineProperty( matrix4, 'identity', {
            get: function() {
                return Matrix4( [1, 0, 0, 0,
                                 0, 1, 0, 0,
                                 0, 0, 1, 0,
                                 0, 0, 0, 1] ); 
            },
            enumerable: true
        });

        return matrix4;

    };

});

/*jshint white: false, strict: false, plusplus: false, onevar: false,
nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define('matrix/transform',['require','./matrix4'],function ( require ) {

    return function( FLOAT_ARRAY_TYPE ) {

        var matrix4 = require( './matrix4' )( FLOAT_ARRAY_TYPE );

        var Transform = matrix4.$;
        
        var transform = {
                
            $: Transform,

            fixed: function( vt, vr, vs ) {
                var r = matrix4.identity;

                if( vt ) {
                    transform.translate( vt, r );
                }

                if( vr ) {
                    transform.rotate( vr, r );
                }

                if( vs ) {
                    transform.scale( vs, r );
                }

                return r;
            },

            // Convert a vector rotation (in radians) to a 4x4 matrix
            rotate: function( v, result ) {
                var r = result || matrix4.identity;

                var sinA,
                    cosA;

                var ml;
                if( 0 !== v[2] ) {
                    sinA = Math.sin( v[2] );
                    cosA = Math.cos( v[2] );
                    ml = [];
                    ml.push(matrix4.$([ cosA, sinA, 0, 0,
                                       -sinA, cosA, 0, 0,
                                        0, 0, 1, 0,
                                        0, 0, 0, 1 ] ));
                    ml.push(matrix4.$(r));
                    
                    matrix4.multiply( ml, r );
                }

                if( 0 !== v[1] ) {
                    sinA = Math.sin( v[1] );
                    cosA = Math.cos( v[1] );
                    ml = [];
                    ml.push(matrix4.$([ cosA, 0, -sinA, 0,
                                        0, 1, 0, 0,
                                        sinA, 0, cosA, 0,
                                        0, 0, 0, 1 ] ));
                    ml.push(matrix4.$(r));
                    
                    matrix4.multiply( ml, r );
                }

                if( 0 !== v[0] ) {
                    sinA = Math.sin( v[0] );
                    cosA = Math.cos( v[0] );
                    ml = [];
                    ml.push(matrix4.$([ 1, 0, 0, 0,
                                        0, cosA, sinA, 0,
                                        0, -sinA, cosA, 0,
                                        0, 0, 0, 1 ] ));
                    ml.push(matrix4.$(r));
                    
                    matrix4.multiply( ml, r );
                }

                if( !result ) {
                    return r;
                }
            },

            // Convert a vector3 scale to a 4x4 matrix
            scale: function( v, result ) {
                var r = [ v[0], 0.0, 0.0, 0.0,
                           0.0, v[1], 0.0, 0.0,
                           0.0, 0.0, v[2], 0.0,
                           0.0, 0.0, 0.0, 1.0 ];

                if( result ) {
                    matrix4.multiply( [ r, matrix4.$( result ) ], result );
                } else {
                    return r;
                }
            },

            // Convert a vector3 translation to a 4x4 matrix
            translate: function( v, result ) {
                var r = [ 1.0, 0.0, 0.0, 0.0,
                           0.0, 1.0, 0.0, 0.0,
                           0.0, 0.0, 1.0, 0.0,
                           v[0], v[1], v[2], 1.0 ]

                if( result ) {
                    matrix4.multiply( [ r, matrix4.$( result ) ], result );
                } else {
                    return r;
                }
            }

        };
        
        return transform;

    };

});

/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define('_math',['require','./lang','./constants','./vector/vector2','./vector/vector3','./vector/vector4','./vector/quaternion','./matrix/matrix2','./matrix/matrix3','./matrix/matrix4','./matrix/transform'],function ( require ) {

    var lang = require( './lang' ),
        constants = require( './constants' ),
        vector2 = require( './vector/vector2' ),
        vector3 = require( './vector/vector3' ),
        vector4 = require( './vector/vector4' ),
        quaternion = require( './vector/quaternion' ),
        matrix2 = require( './matrix/matrix2' ),
        matrix3 = require( './matrix/matrix3' ),
        matrix4 = require( './matrix/matrix4' ),
        transform = require( './matrix/transform' );

    var _Math = function( options ) {
        
        var _FLOAT_ARRAY_ENUM = {
                Float32: Float32Array,
                Float64: Float64Array
        };
                
        var _FLOAT_ARRAY_TYPE = _FLOAT_ARRAY_ENUM.Float32;
        
        Object.defineProperty( this, 'ARRAY_TYPE', {
            get: function() {
                return _FLOAT_ARRAY_TYPE;
            },
            enumerable: true
        });
        
        lang.extend( this, constants() );
        
        var _vector2 = vector2( _FLOAT_ARRAY_TYPE );
        var _vector3 = vector3( _FLOAT_ARRAY_TYPE );
        var _vector4 = vector4( _FLOAT_ARRAY_TYPE );
        var _quaternion = quaternion( _FLOAT_ARRAY_TYPE );
        
        var _matrix2 = matrix2( _FLOAT_ARRAY_TYPE );
        var _matrix3 = matrix3( _FLOAT_ARRAY_TYPE );
        var _matrix4 = matrix4( _FLOAT_ARRAY_TYPE );
        var _transform = transform( _FLOAT_ARRAY_TYPE );
        
        Object.defineProperty( this, 'Vector2', {
            get: function() {
                return _vector2.$;
            },
            enumerable: true
        });
        Object.defineProperty( this, 'vector2', {
            get: function() {
                return _vector2;
            },
            enumerable: true
        });

        Object.defineProperty( this, 'Vector3', {
            get: function() {
                return _vector3.$;
            },
            enumerable: true
        });
        Object.defineProperty( this, 'vector3', {
            get: function() {
                return _vector3;
            },
            enumerable: true
        });
        
        Object.defineProperty( this, 'Vector4', {
            get: function() {
                return _vector4.$;
            },
            enumerable: true
        });
        Object.defineProperty( this, 'vector4', {
            get: function() {
                return _vector4;
            },
            enumerable: true
        });
        
        Object.defineProperty( this, 'Quaternion', {
            get: function() {
                return _quaternion.$;
            },
            enumerable: true
        });
        Object.defineProperty( this, 'quaternion', {
            get: function() {
                return _quaternion;
            },
            enumerable: true
        });
        
        Object.defineProperty( this, 'Matrix2', {
            get: function() {
                return _matrix2.$;
            },
            enumerable: true
        });
        Object.defineProperty( this, 'matrix2', {
            get: function() {
                return _matrix2;
            },
            enumerable: true
        });
        
        Object.defineProperty( this, 'Matrix3', {
            get: function() {
                return _matrix3.$;
            },
            enumerable: true
        });
        Object.defineProperty( this, 'matrix3', {
            get: function() {
                return _matrix3;
            },
            enumerable: true
        });  
        
        Object.defineProperty( this, 'Matrix4', {
            get: function() {
                return _matrix4.$;
            },
            enumerable: true
        });
        Object.defineProperty( this, 'matrix4', {
            get: function() {
                return _matrix4;
            },
            enumerable: true
        });
        
        Object.defineProperty( this, 'Transform', {
            get: function() {
                return _transform.$;
            },
            enumerable: true
        });
        Object.defineProperty( this, 'transform', {
            get: function() {
                return _transform;
            },
            enumerable: true
        });
        
    };

    return new _Math();

});
  return require( "_math" );
}));
