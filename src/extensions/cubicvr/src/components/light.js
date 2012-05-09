if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define(
  [ "resources/light-definition" ],
  function ( LightDefinition) {

    var Light = function(lightDefinition){
      if (!(lightDefinition instanceof LightDefinition)){
        lightDefinition = new LightDefinition();
      }
      this.definition = lightDefinition;

      var properties = [
        "type",
        "diffuse",
        "specular",
        "intensity",
        "distance",
        "cutoff",
        "map_res",
        "method",
        "areaCeiling",
        "areaFloor",
        "areaAxis"
      ];

      //If no value has been assigned to this specific light for the given property name then return the one from lightDefinition instead
      var defineProperty = function(propertyName, that){
        Object.defineProperty(that, propertyName, {
          get: function() {
            if (that.hasOwnProperty("_" + propertyName)){
              return that["_" + propertyName];
            }else{
              return that.definition[propertyName];
            }
          },
          //I would have caused this to overwrite the setters/getters with something that just returns that[propertyName]
          //but there doesn't appear to be a way to reassign setters/getters for an object, at least not from within the
          //setter
          set: function(value) {
            that["_" + propertyName] = value;
          }
        })
      };

      for (var propertyIndex = 0; propertyIndex < properties.length; propertyIndex++){
        defineProperty(properties[propertyIndex], this);
      }

    };

    return Light;

  });