var width = 500;
var height = 500;
var depth = 500;
var minX = 0;
var maxX = width;
var minY = 0;
var maxY = height;
var minZ = 02;
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
	blue: 0,
	green: 0,
	alpha: 255
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
        z: 0
    },
    peripheral: 60,
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
            y: 0,
            z: maxZ / 2
        },
        end: {
            x: maxX,
            y: maxY,
            z: maxZ / 2
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
	aspect = canvas.width/canvas.height;
	gl.clearColor(1, 1, 1, 1);
	
	for(var i = -1; i < 1; i+= 2/canvas.width) {
		for(var j = 1; j > -1; j-= 2/canvas.height) {
			vertices.push(vec2(i, j));
			locColors.push(vec4(Math.abs(i), Math.abs(j), Math.abs(i - j), 1));
		}
	}
	
	// vertices.push(vec2(-1, 1));
	
	// Load shaders and initialize attribute buffers
	
	var program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);
	
	cBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(locColors), gl.STATIC_DRAW);

	cPosition = gl.getAttribLocation( program, "cPosition" );
	gl.vertexAttribPointer( cPosition, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( cPosition );
	
	var vBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

	var vPosition = gl.getAttribLocation( program, "vPosition" );
	gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );
	render();
}

function render() {
	gl.clear( gl.COLOR_BUFFER_BIT);
    var view = camera.peripheral / 180 * Math.PI * 2;
    var heightWidthRatio = height / width;
    var halfWidth = Math.tan(view);
    var halfHeight = heightWidthRatio * halfWidth;
    var camerawidth = halfWidth * 2;
    var cameraheight = halfHeight * 2;
    var pixelWidth = camerawidth / (width - 1);
    var pixelHeight = cameraheight / (height - 1);

    var ray = {
        start: camera.location
    }

    for(var i = 0; i < width; i++) {
        for(var j = 0; j < height; j++) {
            var x = new Vector(camera.right.x * (i * pixelWidth) - halfWidth,
                                camera.right.y * (i * pixelWidth) - halfWidth,
                                camera.right.z * (i * pixelWidth) - halfWidth);
            var y = new Vector(camera.up.x * (j * pixelHeight) - halfHeight,
                                camera.up.y * (j * pixelHeight) - halfHeight,
                                camera.up.z * (j * pixelHeight) - halfHeight);

            ray.vector = unitVec(camera.vector.x + x.x + y.x,
                                camera.vector.y + x.y + y.y,
                                camera.vector.z + x.z + y.z);

            var color = trace(ray, 0);
            frameBuffer.push(color.red);
            frameBuffer.push(color.green);
            frameBuffer.push(color.blue);
            frameBuffer.push(color.alpha);
        }
    }

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

function lineIntersection(obj, ray) {
    
}