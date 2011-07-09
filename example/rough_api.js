function Game() {

    Paladin.init( {debug: true} );

    var scene = new Paladin.Scene();
    
    var camera = new Paladin.component.Camera();
    camera.setSpatial( new Paladin.component.Spatial() );
    camera.setParent( scene );
    
    var mesh = new Paladin.graphics.Mesh( {
        primitives: [ {
            type: 'box',
            size: 0.5,
            material: {
              color: [1, 0, 0]
            }
          } ],
          finalize: true
        } );
    var box = new Paladin.Entity();
    box.spatial = new Paladin.component.Spatial( [-1, 0, -1] );
    box.model = new Paladin.component.Model( {
        mesh: mesh 
    } );
    box.model.setSpatial( box.spatial );
    box.model.setParent( scene );
    
    this.run = function () {
      Paladin.run();
    };

};
