/*
 * SPRITE - VIKING - BLITR
 * A Submodule of Sprite-Viking, the Sprite-sheet to JSON cutting tool for HTML5
 * By F1LT3R at Bocoup
 * MIT License: http://www.opensource.org/licenses/mit-license.php
 *
 */
 
/*
  About This Program:

  Blitr caches game-sprites for fast access in your JavaScript games &
  animations. Blit-Cache, creates easy-to-access JavaScript image resources from
  "Sprite-Viking Sprites" stored in JSON format. This code runs in the
  background of your game allowing you to call:

    "viking.spriteName.actionName.frame( frame number )"
     - Get the pixels for the frame passed as an argument.

    "viking.spriteName.actionName.frame()"

      - Auto-increment, get the next frame in the sequence.

  For frame fetching errors, "frame()" will return a value of "false".
   
  Getting the frame returns a pre-calculated pixel array that can be drawn using
  canvas.context.putImage() or you may employ your own method for WebGL etc.
  
*/

(function(){

  // Default options
  var opts = {
    width       : 64,
    height      : 64,
    antialias   : false,
    drawBounds  : false,
    debug       : false
  };

  // Merge (shallow)
  function merge( a, b ){
    for(var member in b){
      a[ member ] = b[ member ];
    }
    return a;
  };

  // Viking - Super Object Interface
  function Viking(){
    this.name = "Sprite-Viking-Blitr";
    merge( this, opts );
    this.sprites = {};
    this.data = { sprites: {} };
    return this;
  };

  Viking.prototype.get = function( url ){
    var xmlr = new window.XMLHttpRequest();
    if( xmlr ){
      xmlr.open( 'GET', url, false );
      xmlr.overrideMimeType("application/json");
      xmlr.send( null );
      return xmlr.responseText;
    }else{
      return false;
    }
  };

    Viking.prototype.loadSprite = function( spriteURL, options ){
    if(!options){ 
      var options = {};
    }
    
    
    var slash       = spriteURL.lastIndexOf('/'),
	      slash       = (slash > -1 ? (slash+1) : 0 ),
	      spriteName  = spriteURL.substr( slash ).split('.')[0]
	  ;
	  
    options.name = spriteName;
    this.data.sprites[ spriteName ] = new Sprite( JSON.parse(this.get( spriteURL )), options, this );
    if( options.callback ){
      options.callback.call( this.data.sprites[ spriteName ] );
    }
    return this.data.sprites[ spriteName ];
    
    /*
    for(var i=0, l=sprites.length; i< l; i++){
      var spriteURI = sprites[i];
      var spriteName =  spriteURI.split('.')[0];
      options.name = spriteName;
      this.data.sprites[ spriteName ] = new Sprite( JSON.parse(this.get( spriteURI )), options, this );
      if( options.callback ){
        options.callback.call( this.data.sprites[ spriteName ] );
      }
    }*/
    
  };


  /////////////////////////////////
  function Sprite( json, options, parent ){
    merge( this, json );
    merge( this, options );
    this.parent = parent;
    this.init();
    return this;
  };

  Sprite.prototype.init = function( dataURI ){
    this.blits = [];

    var self = this;

    this.img = new Image();

    this.img.onload = function(){
      var maxHeight = 0, maxWidth = 0, coords, width, height, xRatio,
          yRatio, ratio;

      // Determine the maximum dimensions of this sprite
      for(var i=0, l=self.rect.length; i< l; i++){
        coords = self.rect[ i ];
        width = coords[2] - coords[0];
        height = coords[3] - coords[1];
        if( width > maxWidth ){ maxWidth = width; }
        if( height > maxHeight ){ maxHeight = height; }
      }
      
      // Work out the ratio between sprite's dimensions & Sprite-Viking output
      xRatio = self.parent.width / maxWidth;
      yRatio = self.parent.height / maxHeight;
      self.ratio = xRatio < yRatio ? xRatio : yRatio ;
      
      if( self.ratio > 1 ){
        self.ratio = 1;
      }
      
      self.ctx = document.createElement( 'canvas' ).getContext( '2d' );
      self.ctx.canvas.width = this.width;
      self.ctx.canvas.height = this.height;

      if( !self.parent.antialias ){
//        self.ctx.mozImageSmoothingEnabled = false;
      }

// humph: perf debugging of drawpath issue
//      self.ctx.save();
//        self.ctx.scale( self.ratio, self.ratio );
        self.ctx.drawImage( this, 0, 0 );
//      self.ctx.restore();

      self.blit.call( self );
            
      // Debug output (visual dump)
//      if( self.debug ){
//        self.draw.call( self );
//      };

      return this;
    };

    if( dataURI ){
      this.datauri = dataURI;
    }

    this.img.src = this.datauri;
  };

  Sprite.prototype.reInit = function( dataURI ){
    this.datauri = null;
    this.init( dataURI );
  };

  Sprite.prototype.draw = function(){
//    this.parent.debug.appendChild( this.ctx.canvas );
  };

  Sprite.prototype.blit = function( drawBounds ){
    var rect, bounds, self = this;
    
    function drawBounds( c ){
//      self.ctx.strokeRect( c[0], c[1], c[2], c[3]) ;
    };

    function getFrame( c ){
      return self.ctx.getImageData(~~c[0], ~~c[1], ~~c[2], ~~c[3]);
    };

    for(var i=0, l=this.rect.length; i< l; i++){
      rect = this.rect[ i ],
      bounds = [~~rect[0]*this.ratio, ~~rect[1]*this.ratio, (~~rect[2]-~~rect[0])*this.ratio, (~~rect[3]-~~rect[1])*this.ratio, rect[4]*this.ratio, rect[5]*this.ratio];
      if( this.parent.drawBounds ){
        //this.ctx.strokeStyle='rgba(0,255,0,.75)';
        this.ctx.lineWidth=1;
        drawBounds( bounds );
     }
//      try{
        this.blits[i] = getFrame(bounds);
        var canvas = document.createElement('canvas');
        canvas.width = this.parent.width;
        canvas.width = this.parent.height;
        var context = canvas.getContext('2d');
        context.putImageData(getFrame(bounds), bounds[4], bounds[5]);
        this.blits[i] = context.getImageData(0, 0, this.parent.width, this.parent.height);
                
//        if( this.parent.debug ){
//          this.parent.blit_ctx.clearRect(0, 0, this.width, this.height);
//          this.parent.blit_ctx.putImageData( this.blits[i], bounds[4], bounds[5] );
//        }
//      }catch(e){
//        //console.log( this.action, type );
//        //console.log( 'Could not blit "rect '+ this.action[type].rects[i] +'" when processing "'+this.name+'.'+type+'" - Possible error: "Sprite co-ords outside of sheet bounds".', e );
//      }
    }

    // Copy sprite image data to memory: Viking.sprites.action.frame
    var spriteBlock = this.parent.sprites[this.name] = {};
    for(var type in this.action){
      var actionBlock = spriteBlock[type] = new Action( type );
      for(i=0, l=this.action[type].rects.length; i< l; i++){ 
        actionBlock.frames[i] = this.blits[this.action[type].rects[i]];
        if(!actionBlock.frames[i]){
          console.log( 'Could not blit "rect '+ this.action[type].rects[i] +'" when processing "'+this.name+'.'+type+'" - Possible error: "Sprite co-ords outside of sheet bounds".' );
        }
      }
    }

  };

  function Action( type ){
    return merge( this, {
      type: type,
      frames: [],
      currentFrame: -1,
    });
  };
  
  Action.prototype.frame = function( frame ){
    try{
      if( frame !== undefined ){
        return this.frames[frame];
      }else{
        this.currentFrame++;
        if( this.currentFrame > this.frames.length-1 ){
          this.currentFrame = 0;
        }
        return this.frames[this.currentFrame];
      }
    }catch(e){
      //console.log(e);
      return false;
    }
  };       
    

  ////////////////////////////////////////
  this.viking = new Viking();
  this.Sprite = Sprite;
})();
