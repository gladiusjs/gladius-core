/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

  return function( engine, service, context ) {

    var math = engine.math;
    var Component = require( '../../core/component' );
    var Delegate = require( '../../core/delegate' );

    return Component({
      type: 'Model'
    },
    function( options ) {

      options = options || {};

      var _this = this;

      var _mesh = options.mesh || null,
          _material = options.material || null;

      Object.defineProperty( this, "mesh", {
          enumerable: true,
          get: function() {
              return _mesh;
          }
      });

      Object.defineProperty( this, "material", {
          enumerable: true,
          get: function() {
              return _material;
          }
      });

      function checkMeshAndMaterial() {
          if( _mesh && _material ) {
              _mesh.prepare({
                  material: _material
              });
              if( options.onComplete ) {
                  options.onComplete( _this );
              } //if
          } //if
      } //checkMeshAndMaterial

      function getMesh( mesh, callback ) {
        var oldOnComplete = mesh.onComplete || function() {};
        mesh.onComplete = function( newMesh ) {
            oldOnComplete( newMesh );
            callback( newMesh );
        };
        service.resource.Mesh( mesh );
      } //getMesh

      function getMaterial( material, callback ) {
        var oldOnComplete = material.onComplete || function() {};
        material.onComplete = function( newMaterial ) {
            oldOnComplete( newMaterial );
            callback( newMaterial );
        };
        service.resource.Material( material );
      } //getMaterial

      if( options.material && options.material.script && options.mesh && options.mesh.script ) {
          _material = null;
          _mesh = null;
          getMaterial( options.material, function( newMaterial ) {
              _material = newMaterial;
              checkMeshAndMaterial();
          });
          getMesh( options.mesh, function( newMesh ) {
              _mesh = newMesh;
              checkMeshAndMaterial();
          });
      } //if

      var handleOwnerChanged = function( e ) {
      }; //ownerChangedHandler

      this.ownerChanged.subscribe( handleOwnerChanged );

    });

  };

});
