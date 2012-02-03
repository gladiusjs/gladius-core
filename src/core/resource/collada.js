/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {
    
    return function( engine ) {
        
        var Collada = engine.base.Resource({
            type: 'Collada',
            cache: null       
        },
        
        // sceneObject
        function( source ) {
            var _source = source,
                that = this;

            this.isCollada = true;
            
            this._cvr = {};
            var _cvrMesh = _source;
            this._cvr.mesh = _cvrMesh;

            this._cvr.mesh.rotation[0] *= Math.PI/180;
            this._cvr.mesh.rotation[1] *= Math.PI/180;
            this._cvr.mesh.rotation[2] *= Math.PI/180;

            this.prepare = function( options ) {}
            
            // Create and return a new entity tree from this template
            this.create = function( options ) {
                options = options || {};
                return _create( source );
            };
            
        });
        return Collada;

    };
});

