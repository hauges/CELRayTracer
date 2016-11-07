var width = 512;
var height = 512;
var depth = 512;
var minX = 0;
var maxX = width;
var minY = 0;
var maxY = height;
var minZ = 0;
var maxZ = depth;

var vertices = [];

var locColors = [];

var vPosition, cBuffer, cPosition;

var canvas;
var gl;
var colorLoc;

var frameBuffer = [];

var backgroundColor = {
	red: 0,
	green: 1,
	blue: 1,
	alpha: 1
};

function Vector(_x, _y, _z) {
    this.x = _x;
    this.y = _y;
    this.z = _z;
};

var camera = {
    location: {
        x: width / 2,
        y: height / 2,
        z: -depth / 2
    },
    peripheral: 45,
    vector: {
        x: 0,
        y: 0,
        z: 1
    },
    right: {
        x: 1,
        y: 0,
        z: 0
    },
    up: {
        x: 0,
        y: 1,
        z: 0
    }
};

var lights = [ // can add as many lights as possible
    {
        x: maxX,
        y: maxY,
        z: maxZ
    }
];

var objects = [ // add objects here (needs atleas a color and points)
    {
        type: 'line',
        start: {
            x: 0,
            y: 50,
            z: 0
        },
        end: {
            x: maxX,
            y: 50,
            z: 0
        },
		color: {
			red: 0,
			green: 1,
			blue: 0,
			alpha: 1
		}
    }
];


window.onload = function init() {
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
	width = canvas.width;
	height = canvas.height;
	maxX = width;
	maxY = height;
	aspect = canvas.width/canvas.height;
	gl.clearColor(1, 1, 1, 1);
	
	// for(var i = -1; i < 1; i+= 2/canvas.width) {
		// for(var j = 1; j > -1; j-= 2/canvas.height) {
			// vertices.push(vec2(i, j));
			// frameBuffer.push(vec4(Math.abs(i), Math.abs(j), Math.abs(i - j), 1));
		// }
	// }
	
	// vertices.push(vec2(0, 0));
	// vertices.push(vec2(2/canvas.width, 2/canvas.height));
	// frameBuffer.push(vec3(0, 1, 0));
	// frameBuffer.push(vec3(1, 0, 0));
	
	// vertices.push(vec2(-1, 1));
	
	createImage();
	
	// Load shaders and initialize attribute buffers
	
	var program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);
	
	cBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(frameBuffer), gl.STATIC_DRAW);

	cPosition = gl.getAttribLocation( program, "cPosition" );
	gl.vertexAttribPointer( cPosition, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( cPosition );
	
	var vBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

	var vPosition = gl.getAttribLocation( program, "vPosition" );
	gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );
	render();
}

function createImage() {
	var ray = {
		start: camera.location
	}

	for(var i = 0; i < width; i++) {
		for(var j = 0; j < height; j++) {
			var canvasPoint = new Vector(i, j, 0);
			ray.vector = equation3D(camera.location, canvasPoint);

			var color = trace(ray, 0);
			
			vertices.push(vec2(i * 2 / width - 1, j * 2 / height - 1))
			frameBuffer.push(vec4(color.red, color.green, color.blue, color.alpha));
		}
	}
}

function render() {
	gl.clear( gl.COLOR_BUFFER_BIT);

    // draw the frame image here
	
	
	gl.drawArrays(gl.POINTS, 0, vertices.length);
}

function unitVec(x, y, z) {
    var size = Math.sqrt( Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2) );
    return new Vector(x / size, y / size, z / size);
}

function trace(ray, depth) {
    if(depth > 1) { // I think 1 is right... This may have to be changed
        return;
    }

    var firstObj = detectCollision(ray);

    if(firstObj.distance == null) {
        return backgroundColor;
    }

    return getColor();
}

// intersectScene
function detectCollision(ray) {
    var firstObj = {
        distance: null,
        object: null
    }

    for(var obj in objects) {
        // check to see if there is an intersection and if its closer than firstObj
        if(obj.type == 'line') {
            var result = lineIntersection(obj, ray);

        }
    }

    return firstObj;
}

// surface
function getColor(ray, object, point, n, depth) {
    return object.color; // will require a lot more for lighting 
}

function equation3D(point1, point2) {
	return unitVec(point1.x - point2.x, point1.y - point2.y, point1.z - point2.z);
}

function lineIntersection(obj, ray) {
    
}