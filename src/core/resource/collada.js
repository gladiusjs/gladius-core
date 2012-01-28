/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {
    
    return function( engine ) {
        
        var Collada = engine.base.Resource({
            type: 'Collada',
            cache: null       
        },
        function( source ) {
            var _source = source,
                that = this;

            this._cvr = {};
            var _cvrMesh = _source;
            this._cvr.mesh = _cvrMesh;

			this.prepare = function( options ) {};
            
            // Create and return a new entity tree from this template
            this.create = function( options ) {
                options = options || {};
                return _create( source );
            };
            
        });
        return Collada;

    };
});

