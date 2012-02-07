var BitmapCubeArray = function(width,height,texture,spacing)
{
  this.mesh = new CubicVR.Mesh();
  this.width = width;
  this.height = height;
  this.texture = texture;
  this.mat = new CubicVR.Material();
  this.spacing  = spacing;
  if (texture) this.changeTexture(texture);
	this.genBoxArray(spacing);
	this.frameCount=0;
}


BitmapCubeArray.prototype.changeTexture = function()
{
  this.mat.setTexture(this.texture,CubicVR.enums.texture.map.COLOR);
  this.mat.setTexture(this.texture,CubicVR.enums.texture.map.ALPHA);    
}



BitmapCubeArray.prototype.genBoxArray = function(){
  
  this.tmpMesh = new CubicVR.Mesh();
  this.cDiv = (this.width>this.height)?(1.0/this.height):(1.0/this.width);  

  this.trans = new CubicVR.Transform();

  this.trans.clearStack();
  this.trans.scale([1,1,1]);

  CubicVR.genPlaneObject(this.tmpMesh,1.0,this.mat);
  
  this.tmpMesh.faces[0].uvs = [[1,0],[1,1],[0,1],[0,0]];
  this.tmpMesh.faces[1].uvs = [[0,0],[0,1],[1,1],[1,0]];
  
  var is = 0.1/8.0;

  // create outside faces first to help with Early-Z
  this.trans.clearStack();
  this.trans.translate([0,0,-0.05]);
  this.mesh.booleanAdd(this.tmpMesh,this.trans);    
  this.trans.clearStack();
  this.trans.translate([0,0,0.05]);
  this.mesh.booleanAdd(this.tmpMesh,this.trans);    

  var p;
  
  for (var i = -0.05+is; i < 0.05-is; i+= is)
  {
      this.trans.clearStack();
      this.trans.translate([0,0,i]);
      this.mesh.booleanAdd(this.tmpMesh,this.trans);    
      p++;
  }


	this.mesh.calcNormals();
	this.mesh.triangulateQuads();
	this.mesh.compile();

}
