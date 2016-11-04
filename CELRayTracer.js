
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
var LIGHT1_Z = 30;
var LIGHT2_Z = 50;


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
	
	theta[0] = 60;
	theta[1] = 10;
	theta[2] = 35;
	
	
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
	
}