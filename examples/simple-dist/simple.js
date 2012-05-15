document.addEventListener( "DOMContentLoaded", function( e ){

  var engine = new Gladius();
  console.log( "engine loaded" );
  engine.registerExtension( Gladius["gladius-cubicvr"] );
  engine._scheduler.update();
  console.log( engine._scheduler._schedule );

});
