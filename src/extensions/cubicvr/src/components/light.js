if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define(
  [ "resources/light-definition" ],
  function ( LightDefinition) {

    var Light = function(context, lightDefinition){

      var cubicVRLight = new context.Light();

      this._cubicVRLight = cubicVRLight.bind(context.Light());

      if (!(lightDefinition instanceof LightDefinition)){
        lightDefinition = new LightDefinition();
      }
      this.definition = lightDefinition;

      //Assign all of these values to the cubicVRLight
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
            //Set the corresponding property in cubicVRLight
            if (propertyName != "type"){
              that._cubicVRLight[propertyName] = value;
            }else{
              that._cubicVRLight["light_type"] = value;
            }
          }
        })
      };

      for (var propertyIndex = 0; propertyIndex < properties.length; propertyIndex++){
        defineProperty(properties[propertyIndex], this);
        if (properties[propertyIndex] != "type"){
          this._cubicVRLight[properties[propertyIndex]] = lightDefinition[properties[propertyIndex]];
        }else{
          this._cubicVRLight["light_type"] = lightDefinition[properties[propertyIndex]];
        }
      }

    };

    var onUpdate = function(){
      //You can see something that might be a good example of an update function in old-src/physics/2d/box2d/service.js

      //In our update function we need to set the cubicVR light's position to the absolute transform
      //Not really sure how that will do anything other than make every single light be in the same position.
      //Guess that the transform must change to the correct values before this method gets called
      _cubicVRLight.position = this.owner.findComponent( "Transform" ).absolute();
      _cubicVRLight.position = this.owner.findComponent( "Rotation" ).absolute();
    }

    return Light;

  });