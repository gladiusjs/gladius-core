
    function proc( options ) {
        options = options || {};
        
        return {
            type: "point",
            method: "dynamic",
            diffuse: [ 1, 1, 1 ],
            specular: [ 1, 1, 1 ],
            intensity: options.intensity || 10,
            distance: 10
        };
    };
