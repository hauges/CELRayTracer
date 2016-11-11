var width = 512;
var height = 512;
var depth = 512;
var minX = 0;
var maxX = width;
var minY = 0;
var maxY = height;
var minZ = 0;
var maxZ = depth;
var maxRayLength = depth;

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
        x: 400,
        y: 400,
        z: 200
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
			red: 0.0,
			green: 1.0,
			blue: 0.0,
			alpha: 1.0
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
    var firstObj = detectCollision(ray);

    if(firstObj.distance === Infinity) {
        return backgroundColor;
    }

    return getColor(firstObj, ray);
}

function getNormal(vector) {
    //console.log(vector.x);
    return normalize(vec3(
        vector.x, 
        vector.y, 
        vector.z
    ), 0);
}

// intersectScene
function detectCollision(ray) {
    var firstObj = {
        distance: Infinity,
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
    }

    return firstObj;
}

// surface
function getColor(object, ray) {
    var color = object.object.color; // will require a lot more for lighting 
    var point = {
        x: ray.start.x + ray.vector.x * object.distance,
        y: ray.start.y + ray.vector.y * object.distance,
        z: ray.start.z + ray.vector.z * object.distance
    };
    //console.log(ray.start.x,ray.start.y, ray.start.z);
    //console.log(ray.vector.x, ray.vector.y, ray.vector.z);
    //console.log(point.x, point.y, point.z);

    var pointNormal = getNormal( equation3D(object.object.center, point) );
    var pointToLightNormal;
    var scaleFactor = 0.0;

    for(var i = 0; i < lights.length; i++) {
        pointToLightNormal = getNormal( equation3D(point, lights[i]) );
        scaleFactor = scaleFactor + dot(pointToLightNormal,pointNormal);
    }

    //console.log(pointNormal);
    //console.log(pointToLightNormal);

    //console.log(scaleFactor);
    scaleFactor = Math.max(scaleFactor, 0.25);
    //console.log(scaleFactor);

    var newColor = {
        red: color.red * scaleFactor,
        green: color.green * scaleFactor,
        blue: color.blue * scaleFactor,
        alpha: color.alpha
    };

    //console.log(newColor);
    //console.log('');

    return newColor;
}

function equation3D(point1, point2) {
	return unitVec(point2.x - point1.x, point2.y - point1.y, point2.z - point1.z);
}

function sphereIntersection(obj, ray) {
	/*var rayStartToSphhere = vec3(
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
	}*/

    var cx = obj.center.x;
    var cy = obj.center.y;
    var cz = obj.center.z;
    var R = obj.radius;

    var x0 = ray.start.x;
    var y0 = ray.start.y;
    var z0 = ray.start.z;
    var x1 = x0 + ray.vector.x * maxRayLength;
    var y1 = y0 + ray.vector.y * maxRayLength;
    var z1 = z0 + ray.vector.z * maxRayLength;

    var dx = x1 - x0;
    var dy = y1 - y0;
    var dz = z1 - z0;

    var a = dx*dx +dy*dy + dz*dz;
    var b = 2*dx*(x0 - cx) + 2*dy*(y0 - cy) + 2*dz*(z0 - cz);
    var c = cx*cx + cy*cy + cz*cz + x0*x0 + y0*y0 + z0*z0 - 2*(cx*x0 + cy*y0 + cz*z0) - R*R;

    if((b*b - 4*a*c) >= 0) {
        var t = (-b - Math.sqrt(b*b - 4*a*c)) / (2*a);
        return maxRayLength * t;
    }
}