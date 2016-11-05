
var canvas;
var gl;
var colorLoc;
var modelviewLoc;
var projectionLoc;

var grassTexture;
var wallTexture;


var shapeList = [];
var vertices = [];
var colors = [];

var theta = [];
var angles = [];
var c = [];
var s = [];

var SHADOW_COLOR = vec4(.1, .1, .1, 1.0);
var LIGHT1_X = 50;
var LIGHT2_X = -50;
var LIGHT1_Y = 50;
var LIGHT2_Y = 50;
var LIGHT1_Z = 50;
var LIGHT2_Z = 50;
var CAMERA = vec3(160, 600, 140);
var AT = vec3(0.0, 0.0, 0.0);
var UP = vec3(0.0, 0.0, 1.0);
var TEXSIZE = 256;
var NUMCHECKS = 8;


var light1 = vec3(LIGHT1_X, LIGHT1_Y, LIGHT1_Z);
var light2 = vec3(LIGHT2_X, LIGHT2_Y, LIGHT2_Z);

var projection;
var modelView;
var shadowProjection1;
var shadowProjection2;
var aspect;


var Shape = function () {
	// the gl.[Draw Type]
	this.drawType = -1;
	// Index to start in the vertices array
	this.startIndex = -1;
	// Length of points to look for shape
	this.length = -1;
	// Color of object
	this.color = vec4(1.0, 1.0, 1.0, 1.0);
	// Ignore shadow 
	this.ignoreShadow = false;
};


function configureGroundTexture() {
	
	var image1 = new Uint8Array(4*TEXSIZE * TEXSIZE);
	for ( var i = 0; i < TEXSIZE; i++ ) {
		for ( var j = 0; j <TEXSIZE; j++ ) {
			var patchx = Math.floor(i/(TEXSIZE/NUMCHECKS));
			var patchy = Math.floor(j/(TEXSIZE/NUMCHECKS));
			if(patchx%2 ^ patchy%2) c = 255;
			else c = 0;
			var loc = 4*i*TEXSIZE+4*j;
			image1[loc] = c;
			image1[loc+1] = c;
			image1[loc+2] = c;
			image1[loc+3] = 255;
		}
	}
	grassTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, grassTexture);
	gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, TEXSIZE, TEXSIZE, 0, gl.RGBA, 
		gl.UNSIGNED_BYTE, image1);
	gl.generateMipmap(gl.TEXTURE_2D);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 
		gl.NEAREST_MIPMAP_LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}


function configureImageTexture() {
	wallTexture = gl.createTexture();
	wallTexture.image = new Image();
	wallTexture.image.onload = function () {
		handleLoadedTexture(wallTexture);
	};
	wallTexture.image.src = "hills.jpg";
	canvas.drawImage(wallTexture.image, 0, 0);
	
}

// Images
// http://learningwebgl.com/blog/?p=507
// https://msdn.microsoft.com/en-us/library/dn385805(v=vs.85).aspx
// http://stackoverflow.com/questions/12250953/drawing-an-image-using-webgl
// https://www.khronos.org/webgl/wiki/Tutorial
function handleLoadedTexture(texture) {
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D,  0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.bindTexture(gl.TEXTURE_2D, null);
}

window.onload = function init() 
{
	canvas = document.getElementById("gl-canvas");
	gl = WebGLUtils.setupWebGL(canvas);
	if ( !gl ) 
	{
		alert ( "WebGL isn't available");
	}
	
	// 
	// Configure WebGL
	// 
	
	gl.viewport(0, 0, canvas.width, canvas.height);
	aspect = canvas.width/canvas.height;
	gl.clearColor(1, 1, 1, 1);
	gl.enable(gl.DEPTH_TEST);
	
	// Set up view
	
	theta[0] = 0;
	theta[1] = 0;
	theta[2] = 0;
	
	// Z-axis arrow
	var lineZ = new Shape();
	lineZ.drawType = gl.LINES;
	lineZ.startIndex = vertices.length;
	lineZ.length = 2;
	lineZ.color = vec4(1, 0, 0, 1);
	vertices.push(vec4(0, 0, 0, 1));
	vertices.push(vec4(0, 0, 100, 1));
	lineZ.ignoreShadow = true;
	shapeList.push(lineZ);
	
	// Y-axis arrow
	var lineY = new Shape();
	lineY.drawType = gl.LINES;
	lineY.startIndex = vertices.length;
	lineY.length = 2;
	lineY.color = vec4(0, 0, 1, 1);
	vertices.push(vec4(0, 0, 0, 1));
	vertices.push(vec4(0, 100, 0, 1));
	lineY.ignoreShadow =  true;
	shapeList.push(lineY);
	
	// X-axis arrow
	var lineX = new Shape();
	lineX.drawType = gl.LINES;
	lineX.startIndex = vertices.length;
	lineX.length = 2;
	lineX.color = vec4(0, 0, 0, 1);
	vertices.push(vec4(0, 0, 0, 1));
	vertices.push(vec4(100, 0, 0, 1));
	lineX.ignoreShadow = true;
	shapeList.push(lineX);
	
	
	// Create ground
	
	var ground = new Shape();
	ground.drawType = gl.TRIANGLES;
	ground.startIndex = vertices.length;
	ground.length = 6;
	ground.color = vec4(0, 1, .1, 1);
	vertices.push(vec4(1000, 1000, 0, 1));
	vertices.push(vec4(1000, -1000, 0, 1));
	vertices.push(vec4(-1000, 1000, 0, 1));
	vertices.push(vec4(1000, -1000, 0, 1));
	vertices.push(vec4(-1000, 1000, 0, 1));
	vertices.push(vec4(-1000, -1000, 0, 1));
	ground.ignoreShadow = true;
	shapeList.push(ground);
	
	// Create back wall
	var wall = new Shape();
	wall.drawType = gl.LINE_LOOP;
	wall.startIndex = vertices.length;
	wall.length = 4;
	wall.color = vec4(0, 0, 0, 1);
	vertices.push(vec4(500, -100, 500, 1));
	vertices.push(vec4(-1000, -1000, 500, 1));
	vertices.push(vec4(-1000, -1000, 0, 1));
	vertices.push(vec4(500, -1000, 0, 1));
	wall.ignoreShadow = true;
	shapeList.push(wall);
	
	// http://webglfundamentals.org/webgl/lessons/webgl-image-processing.html
	
	// Load shaders and initialize attribute buffers
	
	var program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);
	
	colorLoc = gl.getUniformLocation (program, "color");
	modelViewLoc = gl.getUniformLocation (program, "modelView");
	projectionLoc  = gl.getUniformLocation (program, "projection");
	
	var vBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

	var vPosition = gl.getAttribLocation( program, "vPosition" );
	gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );
	
	/* var tBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer);
	gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );

	var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
	gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vTexCoord );
	
	configureGroundTexture();
	
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, grassTexture);
	gl.uniform1i(gl.getUniformLocation(program, "Tex0"), 0); */
	
	render();
}

function render() {
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	var i;
	for ( i = 0; i < 3; i++) {
		angles[i] = radians(theta[i]);
		c[i] = Math.cos(angles[i]);
		s[i] = Math.sin(angles[i]);
	}
	
	// Rotation
	
	var rx = mat4 (1.0, 0.0, 0.0, 0.0,
	           0.0, c[0], -s[0], 0.0,
			   0.0, s[0], c[0], 0.0,
			   0.0, 0.0, 0.0, 1.0);
				   
	var ry = mat4 (c[1], 0.0, s[1], 0.0,
			   0.0, 1.0, 0.0, 0.0,
			   -s[1], 0.0, c[1], 0.0,
			   0.0, 0.0, 0.0, 1.0);
	
	var rz = mat4 (c[2], -s[2], 0.0, 0.0,
			   s[2], c[2], 0.0, 0.0,
			   0.0, 0.0, 1.0, 0.0,
			   0.0, 0.0, 0.0, 1.0);
	
	tz1 = mat4 (1.0, 0.0, 0.0, -50/2.0,
			   0.0, 1.0, 0.0, -50/2.0,
			   0.0, 0.0, 1.0, -50/2.0,
			   0.0, 0.0, 0.0, 1.0);
			   
	tz2 = mat4 (1.0, 0.0, 0.0, 50/2.0,
			   0.0, 1.0, 0.0, 50/2.0,
			   0.0, 0.0, 1.0, 50/2.0,
			   0.0, 0.0, 0.0, 1.0);
	
	var looking = lookAt(
					CAMERA, // Eye
					AT, // At
					UP); // Up
	projection = perspective(35.0, aspect, 1, 20 * 100);
	var rotation = mult(rz, mult(ry, rx));
	modelView = mult(looking, mult(tz2, mult(rotation, tz1)));
	
	gl.uniformMatrix4fv (modelViewLoc, false, flatten(modelView));
	gl.uniformMatrix4fv (projectionLoc, false, flatten(projection));
	
	
	for ( i = 0; i < shapeList.length; i++) {
		gl.uniform4fv(colorLoc, shapeList[i].color);
		gl.drawArrays(shapeList[i].drawType, shapeList[i].startIndex, 
			shapeList[i].length);
	}
	
	
	// Set up shadow projection
	shadowProjection1 = mat4();
	shadowProjection1[3][3] = 0;
	shadowProjection1[3][1] = -1/light1[1];
	modelView = mult(modelView, translate(light1[0], light1[1], light1[2]));
	modelView = mult(modelView, shadowProjection1);
	modelView = mult(modelView, translate(-light1[0], -light1[1], -light1[2]));
	gl.uniformMatrix4fv(modelViewLoc, false, flatten(modelView));
	gl.uniform4fv(colorLoc, SHADOW_COLOR);
	for(var i = 0; i < shapeList.length; i++) {
		if (!shapeList[i].ignoreShadow) { // Handle the ground issue
			gl.drawArrays(shapeList[i].drawType, shapeList[i].startIndex, 
				shapeList[i].length);
		}
	}
	
	shadowProjection2 = mat4();
	shadowProjection2[3][3] = 0;
	shadowProjection2[3][1] = -1/light2[1];
	modelView = mult(modelView, translate(light2[0], light2[1], light2[2]));
	modelView = mult(modelView, shadowProjection2);
	modelView = mult(modelView, translate(-light2[0], -light2[1], -light2[2]));
	gl.uniformMatrix4fv(modelViewLoc, false, flatten(modelView));
	gl.uniform4fv(colorLoc, SHADOW_COLOR);
	for(var i = 0; i < shapeList.length; i++) {
		if (!shapeList[i].ignoreShadow) { // Handle the ground issue
			gl.drawArrays(shapeList[i].drawType, shapeList[i].startIndex, 
				shapeList[i].length);
		}
	}
	render;
}