(function (window, document, Paladin, undefined) {

  var subsystems = {};

  Paladin.subsystem = {

    register: function ( name, subsystem ) {
      subsystems[ name ] = subsystem;
    },

    init: function ( options ) {
      var newSubsystems = {};
      for ( var name in subsystems ) {
        if ( subsystems.hasOwnProperty( name ) ) {
          newSubsystems[ name ] = new subsystems[ name ]( options );
        } //if
      } //for
      return newSubsystems;
    },

    get: function ( name ) {
      return subsystems[ name ];
    }

  };

})(window, window.document, Paladin);
