
var canvas;
var gl;
var colorLoc;
var modelviewLoc;
var projectionLoc;


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
var CAMERA = vec3(0, 100, 300);
var AT = vec3(0.0, 0.0, 0.0);
var UP = vec3(0.0, 0.0, 1.0);


var light1 = vec3(LIGHT1_X, LIGHT1_Y, LIGHT1_Z);
var light2 = vec3(LIGHT2_X, LIGHT2_Y, LIGHT2_Z);

var projection;
var modelView;
var shadowProjection;
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
};

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
	
/* 	var shape = new Shape();
	shape.drawType = gl.TRIANGLES;
	shape.startIndex = 0;
	shape.length = 3;
	shape.color = vec4(0,1,0,1);
	
	vertices.push(vec4(0,50,0,1));
	vertices.push(vec4(0,0,0,1));
	vertices.push(vec4(50,50,0,1));
	
	shapeList.push(shape); */
	
	
	// Z-axis arrow
	var line = new Shape();
	line.drawType = gl.LINES;
	line.startIndex = vertices.length;
	line.length = 2;
	line.color = vec4(1, 0, 0, 1);
	vertices.push(vec4(0, 0, 0, 1));
	vertices.push(vec4(0, 0, 100, 1));
	shapeList.push(line);
	
	// Y-axis arrow
	var line = new Shape();
	line.drawType = gl.LINES;
	line.startIndex = vertices.length;
	line.length = 2;
	line.color = vec4(0, 0, 1, 1);
	vertices.push(vec4(0, 0, 0, 1));
	vertices.push(vec4(0, 100, 0, 1));
	shapeList.push(line);
	
	// X-axis arrow
	var line = new Shape();
	line.drawType = gl.LINES;
	line.startIndex = vertices.length;
	line.length = 2;
	line.color = vec4(0, 1, 0, 1);
	vertices.push(vec4(0, 0, 0, 1));
	vertices.push(vec4(100, 0, 0, 1));
	
	shapeList.push(line);
	
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
	projection = perspective(45.0, aspect, 1, 20 * 100);
	var rotation = mult(rz, mult(ry, rx));
	modelView = mult(looking, mult(tz2, mult(rotation, tz1)));
	
	gl.uniformMatrix4fv (modelViewLoc, false, flatten(modelView));
	gl.uniformMatrix4fv (projectionLoc, false, flatten(projection));
	
	
	for ( i = 0; i < shapeList.length; i++) {
		gl.uniform4fv(colorLoc, shapeList[i].color);
		gl.drawArrays(shapeList[i].drawType, shapeList[i].startIndex, shapeList[i].length);
	}
	
	
	// Set up shadow projection
	shadowProjection = mat4();
	shadowProjection[3][3] = 0;
	shadowProjection[3][1] = -1/light1[1];
	
}