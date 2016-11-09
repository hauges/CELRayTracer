
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
        type: 'sphere',
        center: {
            x: 200,
            y: 200,
            z: 200
        },
        radius: 50,
		color: {
			red: 0,
			green: 1,
			blue: 0,
			alpha: 1
		}
    },
	{
        type: 'sphere',
        center: {
            x: 400,
            y: 400,
            z: 400
        },
        radius: 50,
		color: {
			red: 1,
			green: 1,
			blue: 0,
			alpha: 1
		}
    },
	{
		type: 'texture-plane', 
		corners: {
			topLeft : {
				x: 512,
				y: 0, 
				z: 30
			},
			topRight : {
				x: 512,
				y: 256, 
				z: 30
			},
			bottomLeft : {
				x: 0,
				y: 0, 
				z: 0
			},
			bottomRight : {
				x: 0,
				y: 256, 
				z: 0
			},
		},
		color: {
			red: 0, 
			green: .9, 
			blue: 0, 
			alpha: 1
		},
		texture: 'grass'
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
		start: camera.location,
		vector: new Vector(-100, -100, -100)
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
    var firstObj = detectCollision(ray);

    if(firstObj.distance == null) {
        return backgroundColor;
    }

    return getColor(firstObj.object);
}

// intersectScene
function detectCollision(ray) {
    var firstObj = {
        distance: null,
        object: null
    }
    for(var i = 0; i < objects.length; i++) {
        // check to see if there is an intersection and if its closer than firstObj
		var obj = objects[i];
        if(obj.type == 'sphere') {
            var distance = sphereIntersection(obj, ray);
			if(distance < firstObj.distance) {
				firstObj.distance = distance;
				firstObj.object = obj;
			}
		} 
		 if (obj.type == 'texture-plane') {
			 var distance = planeIntersection(obj, ray);
			 if (distance < firstObj.distance) {
				 firstObj.distance = distance;
				 firstObj.object = obj;
			 }
		 }
    }

    return firstObj;
}

// surface
function getColor(object) {
    return object.color; // will require a lot more for lighting 
}

function equation3D(point1, point2) {
	return unitVec(point1.x - point2.x, point1.y - point2.y, point1.z - point2.z);
}

function planeIntersection(obj, ray) {
	var planeEquation = determinePlane(obj);
	// console.log(planeEquation);
	var coefficients = planeEquationCrossProduct(planeEquation[0], planeEquation[1]);
	// console.log(coefficients);
	var dValue = planeDValue(coefficients, obj.corners.bottomLeft);
	// console.log(dValue);
	var rayVec3 = vec3(ray.vector.x, ray.vector.y, ray.vector.z);
	var subt = vec3(obj.corners.topLeft.x - ray.start.x, 
		obj.corners.topLeft.y - ray.start.y, 
		obj.corners.topLeft.z - ray.start.z);
	// console.log(subt);
	var t = dot(vec3(coefficients.x, coefficients.y, coefficients.z), subt) / 
		dot(vec3(coefficients.x, coefficients.y, coefficients.z), rayVec3);
	return 0;
}

function planeDValue(coefficients, corner) {
	return coefficients.x * corner.x + coefficients.y * corner.y + coefficients.z * corner.x;
}

function planeEquationCrossProduct(vec1, vec2) {
	return new Vector(vec1.y * vec2.z - vec2.y * vec1.z, 
		vec1.x * vec2.z - vec2.x *vec1.z, 
		vec1.x * vec2.y - vec2.y * vec1.z);
}

function determinePlane(obj) {
	var vec1 = 
		new Vector(obj.corners.topLeft.x - obj.corners.bottomRight.x,
			obj.corners.topLeft.y - obj.corners.bottomRight.y,
			obj.corners.topLeft.z - obj.corners.bottomRight.z);
	var vec2 = 
		new Vector(obj.corners.topRight.x - obj.corners.bottomRight.x,
			obj.corners.topRight.y - obj.corners.bottomRight.y,
			obj.corners.topRight.z - obj.corners.bottomRight.z);
	return [vec1, vec2];
}

function sphereIntersection(obj, ray) {
	var rayStartToSphhere = vec3(
		obj.center.x - ray.start.x,
		obj.center.y - ray.start.y,
		obj.center.z - ray.start.z
	);
	var rayVec3 = vec3(
		ray.vector.x,
		ray.vector.y,
		ray.vector.z
	);
	var vectorLength = dot(rayStartToSphhere, rayVec3);
	var rayStartToSphhereLength = dot(rayStartToSphhere, rayStartToSphhere);
	var d = Math.pow(obj.radius, 2) - rayStartToSphhereLength + Math.pow(vectorLength, 2);
	if(d >= 0) {
		return vectorLength - Math.sqrt(d);
	}
}