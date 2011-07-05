function Game() {

    Paladin.init();

    var render = new Paladin.Scene();

/*    
    var camera = new Paladin.Entity();
    camera.addComponent( new Paladin.component.Spatial() );
    camera.addComponent( new Paladin.component.Camera() );
    camera.setParent( render );

    var mesh = new Paladin.graphics.Mesh();     // graphics.Mesh is not a component

    var obj1 = new Paladin.Entity();
    obj1.addComponent( 'spatial', new Paladin.component.Spatial() );
    obj1.addComponent( 'model', new Paladin.component.Model( mesh ) );  // component.Model should be a SceneObject
    obj1.setParent( render );

    var obj2 = new Paladin.Entity();
    obj2.addComponent( 'spatial', new Paladin.component.Spatial() );
    obj2.addComponent( 'model', new Paladin.component.Model( mesh ) );
    obj2.setParent( render );

    Paladin.tasker.add( {
        callback: function( task ) {
            obj1.getComponent( 'spatial' ).setRotation(); 
            return task.CONT;
        },
        name: 'rotateObject1'
    } );
    Paladin.tasker.add( {
        callback: function( task ) {
            obj2.getComponent( 'spatial' ).setPosition();
            return task.CONT;
        },
        name: 'moveObject2'
    } );
*/

    this.run = function () {
      Paladin.run();
    };

};
