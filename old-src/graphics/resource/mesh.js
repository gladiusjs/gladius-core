/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    return function( engine, context ) {
        
        var Mesh = new engine.base.Resource({
            type: 'Mesh'
        },
        function constructMesh( data ) {

            this._cvr = {};

            var _cvrMesh = new context.Mesh( data );
            this._cvr.mesh = _cvrMesh;

            this.prepare = function( options ) {
                options = options || {};
                
                if( options.material ) {
                    var cvrMaterial = options.material._cvr.material;
                    _cvrMesh.setFaceMaterial( cvrMaterial );
                } //if
                _cvrMesh.prepare();
            }; //prepare
            
        });

        return Mesh;

    };

});
