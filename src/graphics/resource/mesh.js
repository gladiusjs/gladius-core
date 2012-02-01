/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    return function( engine, context ) {
        
        var Mesh = new engine.base.Resource({
            type: 'Mesh'
        },
        function constructMesh( options ) {

            options = options || {};

            this._cvr = {};

            var data; 
            if ( "script" in options ) {
              data = options.script();
            } else {
              //XXX
            }
            var _cvrMesh = new context.Mesh( data );
            this._cvr.mesh = _cvrMesh;

            this.prepare = function( options ) {
                if( options.material ) {
                    var cvrMaterial = options.material._cvr.material;
                    _cvrMesh.setFaceMaterial( cvrMaterial );
                } //if
                _cvrMesh.prepare();
            }; //prepare
            
            options.onsuccess( this ); // XXX
        });

        return Mesh;

    };

});
