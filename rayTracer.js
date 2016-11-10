
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


var countNeg = 0;
var countPos = 0;


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
    // {
        // x: maxX,
        // y: maxY,
        // z: maxZ
    // }, 
	{
		x: 0,
		y: 0, 
		z: 0
	}
]; 

var objects = [ // add objects here (needs atleas a color and points)
    // {
        // type: 'sphere',
        // center: {
            // x: 100,
            // y: 200,
            // z: 0
        // },
        // radius: 50,
		// color: {
			// red: 0,
			// green: 1,
			// blue: 0,
			// alpha: 1
		// }, 
		// normal: null,
		// lighting: true
    // },
	{
        type: 'sphere',
        center: {
            x: 0,
            y: 500,
            z: 200
			},
        radius: 25,
		color: {
			red: 1,
			green: 1,
			blue: 0,
			alpha: 1
		},
		normal: null,
		lighting: true
    },
	{
        type: 'sphere',
        center: {
            x: 100,
            y: 400,
            z: 200
        },
        radius: 50,
		color: {
			red: 1,
			green: .5,
			blue: 0,
			alpha: 1
		},
		normal: null,
		lighting: true
    },
	/*{
        type: 'sphere',
        center: {
            x: 0,
			y: 512,
			z: 0
        },
        radius: 50,
		color: {
			red: 0,
			green: 0,
			blue: 0,
			alpha: 1
		},
		normal: null,
		lighting: true
    }*/
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
	console.log(countNeg, countPos);
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

			var color = trace(ray, 0, i, j);
			
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

function trace(ray, depth, xDir, yDir) {
    var firstObj = detectCollision(ray);

	if(firstObj.distance == null) {
		var color = {
			red: backgroundColor.red,
			blue: backgroundColor.blue - (yDir % 50)/100,
			green: backgroundColor.green - (xDir % 512) /1024,
			alpha: backgroundColor.alpha
		};
		return color;
    }

	 // Gets direction
	var normal = getNormal(firstObj, ray);

    return getColor(firstObj, ray, normal);
}

function getNormal(obj, ray) {
	var normal;
	if(obj.object.type = 'sphere') {
		normal = getSphereNormal(obj, ray);
	}
	return normal;
}

function getSphereNormal(obj, ray) {
	var dist = obj.distance;
	var point = {
		x: ray.vector.x * dist + ray.start.x,
		y: ray.vector.y * dist + ray.start.y,
		z: ray.vector.z * dist + ray.start.z,
	};
	if(obj.object.radius == 25) {
		// console.log(point, Math.sqrt(Math.pow(point.x - obj.object.center.x,2) + Math.pow(point.y - obj.object.center.y,2) + Math.pow(point.z - obj.object.center.z,2)) == obj.object.radius);
	}
	var center = obj.object.center;
	var normal = unitVec(
		point.x - center.x,
		point.y - center.y,
		point.z - center.z
	);
	return normal;
}

// intersectScene()
function detectCollision(ray) {
    var firstObj = {
        distance: null,
        object: null, 
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
		 if (obj.type == 'triangle' ) {
			 // TODO
		 }
    }

    return firstObj;
}

// surface
function getColor(currentObject, ray, normal) {
	var dist = currentObject.distance;
	var point = {
		x: ray.vector.x * dist + ray.start.x,
		y: ray.vector.y * dist + ray.start.y, 
		z: ray.vector.z * dist + ray.start.z
	};
	for(var i = 0; i < lights.length; i++){
		var lightPoint = lights[i];
		var p2lNormal = new Vector(
			lightPoint.x - point.x,
			lightPoint.y - point.y,
			lightPoint.z - point.z
		);

		var ray0 = vec3(p2lNormal.x, p2lNormal.y, p2lNormal.z);
		var len = normalize(ray0, 0);
		var distBetween = length(subtract(vec3(lightPoint.x, lightPoint.y, lightPoint.z), vec3(point.x, point.y, point.z)));
		var ray1 = vec3(normal.x, normal.y, normal.z);

		var shadowRay = {
			start: {
				x: point.x,
				y: point.y,
				z: point.z
			},
			vector: p2lNormal
		};
		var temp = add(vec3(shadowRay.start.x, shadowRay.start.y, shadowRay.start.z), scale(.000001, len));
		shadowRay.start.x = temp[0];
		shadowRay.start.y = temp[1];
		shadowRay.start.z = temp[2];
		var objectReturn = detectCollision(shadowRay);
		if (objectReturn.distance == null || objectReturn.object == currentObject.object) { // Doesn't hit anything
			currentObject.object.color.red = currentObject.object.color.red;
			currentObject.object.color.green = currentObject.object.color.green;
			currentObject.object.color.blue = currentObject.object.color.blue;
		} else {
			objectReturn.object.color.red = objectReturn.object.color.red *.95;
			objectReturn.object.color.green = objectReturn.object.color.green * .95;
			objectReturn.object.color.blue = objectReturn.object.color.blue * .95;
		}
		var scaleFactor = Math.max(dot(ray0, ray1), 0.0);
		if(dot(ray0, ray1) < 0) {
			countNeg++;
		} else {
			countPos++;
		}
		scaleFactor = 1;
		currentObject.object.color.red = currentObject.object.color.red * scaleFactor;
		currentObject.object.color.green = currentObject.object.color.green * scaleFactor;
		currentObject.object.color.blue = currentObject.object.color.blue * scaleFactor;
		
		
		
	}
    return currentObject.object.color; // will require a lot more for lighting 
}

function visibleLightSource(point, currentLight) {
	var obj = detectCollision({
		start: point,
		vector: new Vector(currentLight.x - point.x, currentLight.y - point.y, currentLight.z - point.z)
	});
	return obj.distance == null;
}

function equation3D(point1, point2) {
	return unitVec(point1.x - point2.x, point1.y - point2.y, point1.z - point2.z);
}

function distance3d(p1, p2) {
	var diff = subtract(p1, p2);
	return Math.sqrt(Math.pow(diff[0],2) + Math.pow(diff[1], 2) + Math.pow(diff[2], 2));
}

function planeIntersection(obj, ray) {
	var rayVec3 = vec3(ray.vector.x, ray.vector.y, ray.vector.z);
	var rayStart = vec3(ray.start.x, ray.start.y, ray.start.z);
	var corner1 = vec3(obj.corners.topLeft.x, obj.corners.topLeft.y, obj.corners.topLeft.z);
	var corner2 = vec3(obj.corners.topRight.x, obj.corners.topRight.y, obj.corners.topRight.z);
	var corner3 = vec3(obj.corners.bottomLeft.x, obj.corners.bottomLeft.y, obj.corners.bottomLeft.z);
	var corner4 = vec3(obj.corners.bottomRight.x, obj.corners.bottomRight.y, obj.corners.bottomRight.z);
	// if(!isNaN(eye_to_point)){
		// alert(eye_to_point);
	// }
	var diff1 = subtract(corner1, corner3);
	var diff2 = subtract(corner2, corner3);
	var crossProd = cross(diff1, diff2);
	var norm = normalize(crossProd, false);
	var subt = subtract(norm, rayStart);
	var time = dot(corner1, subt)/dot(corner1, rayVec3); // Getting negative number
	// if(!isNaN(time)){
		// alert(time);
	// }
	var p = add(rayStart, scale(time, rayVec3));
	var eye_to_point = dot(subtract(rayStart, p), subtract(rayStart, p));
	// alert(eye_to_point);
	// var v = dot(subtract(rayStart, p), rayVec3);
	return eye_to_point;
}


function sphereIntersection(obj, ray) {
	// console.log(ray.start);
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