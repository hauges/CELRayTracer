
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
        z: -depth/2
    },
    peripheral: 45,
    vector: {
        x: 0,
        y: 0,
        z: -1
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
    //     x: 512,
    //     y: 512,
    //     z: 0
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
			x: -100,
			y: 400,
			z: 300
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
			x: 500,
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
	{
		type: 'sphere',
		center: {
			x: 300,
			y: 512,
			z: 100
		},
		radius: 50,
		color: {
			red: 1,
			green: 0,
			blue: 0,
			alpha: 1
		},
		normal: null,
		lighting: true
    }
	,
	 {
		type: 'triangle',
		points: [
			vec3(300, 100, 0),
			vec3(400, 200, 0),
			vec3(400, 250, 0)],
		color: {
			red: .5, 
			green: .5, 
			blue: .5, 
			alpha: 1
		}, 
		lighting: true,
		normal : null
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
			// alert(ray.vector.x + " " +  ray.vector.y +" " + ray.vector.z);

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
	// console.log(firstObj);
	if(firstObj.distance === Infinity) {
		var color = {
			red: backgroundColor.red,
			blue: backgroundColor.blue - (yDir % 50)/100,
			green: backgroundColor.green - (xDir % 512) /1024,
			alpha: backgroundColor.alpha
		};
		return color;
	}

	 // Gets direction
	 // console.log(firstObj.object);
	var normal = getNormal(firstObj, ray);

    return getColor(firstObj, ray, normal);
}

function getNormal(obj, ray) {
	var normal;
	if(obj.object.type == 'sphere') {
		normal = getSphereNormal(obj, ray);
	}
	if (obj.object.type == 'triangle') {
		//console.log(obj.object);
		var temp = triangleNormal(obj.object);
		normal = new Vector( temp[0], temp[1], temp[2]);
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
		distance: Infinity,
		object: null, 
	};
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
			var distance = triangleIntersection(obj, ray);
			if ( distance !== undefined &&  distance < firstObj.distance) {
					firstObj.distance = distance;
					firstObj.object = obj;
			}
		 }
	}
	return firstObj;
}

function triangleNormal(obj) {
	var vector1 = subtract(obj.points[0], obj.points[1]);
	var vector2 = subtract(obj.points[2], obj.points[1]);
	// Normal
	var vCross = cross(vector1, vector2);
	var vCrossNorm = normalize(vCross, false);
	return vCross;
}

//http://math.stackexchange.com/questions/305642/how-to-find-surface-normal-of-a-triangle
function triangleIntersection(obj, ray) {
	var rayStart = vec3(ray.start.x,ray.start.y, ray.start.z);
	var rayV = vec3(ray.vector.x, ray.vector.y, ray.vector.z);
	var vCrossNorm = triangleNormal(obj);
	obj.normal = vCrossNorm;
	var denom = dot(rayV, vCrossNorm);
	if (denom == 0) {
		return ;
	}
	var time = (dot(subtract(rayStart, obj.points[1]), vCrossNorm))/denom;
	var point = add(rayStart, scale(time, rayV));
	point[2] += 512;
	
	var xMin = Math.min(obj.points[0][0], obj.points[1][0], obj.points[2][0]) - .1;
	var xMax = Math.max(obj.points[0][0], obj.points[1][0], obj.points[2][0]) + .1;
	var yMin = Math.min(obj.points[0][1], obj.points[1][1], obj.points[2][1]) - .1;
	var yMax = Math.max(obj.points[0][1], obj.points[1][1], obj.points[2][1]) + .1;
	var zMin = Math.min(obj.points[0][2], obj.points[1][2], obj.points[2][2]) - .1;
	var zMax = Math.max(obj.points[0][2], obj.points[1][2], obj.points[2][2]) + .1;
	// console.log(xMin, xMax, yMin, yMax, zMin, zMax);
	// console.log(point);
	if(Math.floor(point[0]) >= xMin && Math.floor(point[0]) <= xMax && Math.floor(point[1]) >= yMin && Math.floor(point[1]) <= yMax && Math.floor(point[2]) >= zMin && Math.floor(point[2]) <= zMax) { 
		var diff = subtract(point, rayStart);
		return Math.sqrt(dot(diff, diff));
	}
	
	return;
	
}

// surface
function getColor(currentObject, ray, normal) {
	// console.log(currentObject, currentObject.object.type);
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
		ray0 = negate(ray0);
		var len = scale(1/(length(ray0)), ray0);
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
		if (objectReturn.distance === Infinity || objectReturn.object == currentObject.object) { // Doesn't hit anything
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
		//scaleFactor = 1;
		// phong shading
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
	} else {
		return;
	}
}