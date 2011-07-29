(function (window, document, Paladin, undefined) {
  document.addEventListener('DOMContentLoaded', function (e) {
    module("Paladin components", {
      setup: function () {
      },
      teardown: function () {
      }
    });

    Paladin.init({ 
      graphics: {
        canvas: document.getElementById('test-canvas') 
      }
    });

    var boss = new Paladin.Entity(), miniBoss = new Paladin.Entity();

    test("Parent entity is clean and ready", function () {
      expect(6);
      ok(boss.getId instanceof Function && boss.getId() !== undefined, "id is a Function which returns something");
      ok(boss.getChildren instanceof Function, "getChildren is a function");
      ok(boss.getChildren() instanceof Array, "Children is an array");
      ok(boss.getChildren().length === 0, "No child entities");
      ok(boss.getComponents('spatial').length === 0, "No child spatial components");
      ok(boss.getComponents('graphics').length === 0, "No child graphics components");
    });

    test("Parent entity gets Spatial and Graphics components", function () {
      boss.addComponent( new Paladin.component.Spatial() );
      boss.addComponent( new Paladin.component.Model() );
      expect(4);
      ok(boss.getComponents('spatial') instanceof Paladin.component.Spatial, "Spatial component is correct");
      ok(boss.getComponents('graphics') instanceof Paladin.component.Model, "Graphics component is correct");
      var spatialChildren = boss.getComponents('spatial').object.children;
      var graphicsChildren = boss.getComponents('spatial').object.children;
      ok(!spatialChildren || spatialChildren.length === 0, "No spatial component children");
      ok(!graphicsChildren || graphicsChildren.length === 0, "No graphics component children");
    });

    test("Add a child entity with spatial component", function () {
      miniBoss.addComponent( new Paladin.component.Spatial() );
      expect(4);
      boss.addChild(miniBoss);
      ok(boss.getChildren().length === 1, "Parent has one child");
      ok(boss.getChildren()[0] === miniBoss, "Parent's child is correct");
      ok(boss.getComponents('spatial').object.children.length === 1, "Spatial component has one child");
      ok(boss.getComponents('spatial').object.children[0] === miniBoss.getComponents('spatial'), "Spatial component child is correct");
    });

    test("Add a graphics component to child entity", function () {
      var graphicsComponent = new Paladin.component.Model();
      miniBoss.addComponent( graphicsComponent );
      expect(3);
      ok(boss.getComponents('graphics').object.children.length === 1, "There is one graphics child component in parent");
      ok(boss.getComponents('graphics').object.children[0] === graphicsComponent, "Child component is corrent component"); 
      ok(boss.getComponents('spatial').object.children.length === 1, "There is one spatial child component in parent");
    });


    //boss.addChild( miniBoss );

  }, false);

})(window, window.document, Paladin);
