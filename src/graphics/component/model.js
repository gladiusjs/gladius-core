/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

  return function( engine, service, context ) {

    var math = engine.math;
    var Component = require( 'base/component' );
    var Delegate = require( 'common/delegate' );

    return Component({
      type: 'Model',
      depends: 'Transform'
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
              if( options.onsuccess ) {
                  options.onsuccess( _this );
              } //if
          } //if
      } //checkMeshAndMaterial

      function getMesh( mesh, callback ) {
        var oldOnsuccess = mesh.onsuccess || function() {};
        mesh.onsuccess = function( newMesh ) {
            oldOnsuccess( newMesh );
            callback( newMesh );
        };
        service.resource.Mesh( mesh );
      } //getMesh

      function getMaterial( material, callback ) {
        var oldOnsuccess = material.onsuccess || function() {};
        material.onsuccess = function( newMaterial ) {
            oldOnsuccess( newMaterial );
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
