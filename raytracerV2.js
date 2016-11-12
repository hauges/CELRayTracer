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

var DEBUG_ARRAY = [];

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
        x: width/2,
        y: height,
        z: depth/2
    }, 
	 {
		 x: width/2, 
		 y: 0, 
		 z: depth/2
	 },
	 {
        x: 0,
        y: height/2,
        z: depth/2
    }
];

var objects = [ // add objects here (needs atleas a color and points)
    {
        type: 'sphere',
        center: {
            x: 100,
            y: height/2,
            z: depth/2 + 200
        },
        radius: 50,
		color: {
			red: 0.0,
			green: 1.0,
			blue: 0.0,
			alpha: 1.0
		},
		reflective: false
    },
	 {
        type: 'sphere',
        center: {
            x: 300,
            y: height/2,
            z: depth/2
        },
        radius: 40,
		color: {
			red: 1.0,
			green: .5,
			blue: 0.0,
			alpha: 1.0
		},
		reflective: false
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
		}, 
		reflective: false
    },
    {
        type: 'sphere',
        center: {
            x: 400,
            y: height/2,
            z: depth/2
        },
        radius: 50,
		color: {
			red: 1,
			green: 1,
			blue: 0,
			alpha: 1
		}, 
		reflective: false
    },
    {
        type: 'sphere',
        center: {
            x: 500,
            y: height/2,
            z: depth/2
        },
        radius: 25,
		color: {
			red: 1,
			green: 1,
			blue: 0,
			alpha: 1
		}, 
		reflective: false
    },
	 {
        type: 'sphere',
        center: {
            x: width/2,
            y: height,
            z:0
        },
        radius: 75,
		color: {
			red: 1,
			green: 0,
			blue: 1,
			alpha: 1
		}, 
		reflective: false
    },
	 {
		type: 'square',
		points: [
			vec3(0, 256, 512),
			vec3(0, 512 + 256, 512),
			vec3(512, 512+ 256, 512)
			],
		color: {
			red: .5, 
			green: .5, 
			blue: .5, 
			alpha: 1
		}, 
		lighting: true,
		normal : null, 
		reflective: true
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
	
	if (depth > 4) {
		return;
	}
    var firstObj = detectCollision(ray, null);
    if(firstObj.distance === Infinity) {
		 var tempColor = {
			red: backgroundColor.red,
			blue: backgroundColor.blue - (yDir % 50)/100,
			green: backgroundColor.green - (xDir % 512) /1024,
			alpha: backgroundColor.alpha
		};
        return tempColor;
    }

    return getColor(firstObj, ray, depth, xDir, yDir);
}

function normalOf(vector) {
    //console.log(vector.x);
    return normalize(vec3(
        vector.x, 
        vector.y, 
        vector.z
    ), 0);
}

function triangleNormal(obj) {
	var vector1 = subtract(obj.points[0], obj.points[1]);
	var vector2 = subtract(obj.points[2], obj.points[1]);
	// Normal
	var vCross = cross(vector1, vector2);
	var vCrossNorm = normalize(vCross, false);
	return vCross;
}

function detectCollision(ray, ignoreObject) {
	var firstObj = {
		distance: Infinity,
		object: null
	}
	for(var i = 0; i < objects.length; i++) {
	// check to see if there is an intersection and if its closer than firstObj
		var obj = objects[i];
		if(obj == ignoreObject) {
			continue;
		}
		if(obj.type == 'sphere') {
			var distance = sphereIntersection(obj, ray);
			if(distance < firstObj.distance) {
				firstObj.distance = distance;
				firstObj.object = obj;
			}
		}
		if (obj.type == 'square' ) {
			var distance = squareIntersection(obj, ray);
			if(distance < firstObj.distance) {
				firstObj.distance = distance;
				firstObj.object = obj;
			}
		}
	}

    return firstObj;
}

function getColor(object, ray, depth, xDir, yDir) {
	if(object.object.type == 'sphere') {
		return getColorSphere(object, ray, depth, xDir, yDir);
	} else if(object.object.type == 'square') {
		return getSquareColor(object, ray, depth, xDir, yDir);
	}
}


function getSquareColor(object, ray, depth, xDir, yDir) {
	var color = object.object.color; 
    var point = {
        x: ray.start.x + ray.vector.x * object.distance,
        y: ray.start.y + ray.vector.y * object.distance,
        z: ray.start.z + ray.vector.z * object.distance
    };
	 if (object.object.reflective) {
		 
		var rayV3 = vec3(ray.vector.x, ray.vector.y, ray.vector.z);
		var normal3 = vec3(object.object.normal.x, object.object.normal.y, object.object.normal.z);
		var scaling = scale(dot(rayV3, normal3), normal3);
		var diff = subtract(rayV3, scale(2, scaling));
		 var reflection = {
			 point: point,
			 vector: new Vector(diff[0], diff[1], diff[2])
		 };
		 var colorReflection = trace(ray, ++depth, xDir, yDir);
		 
		 if (colorReflection) {
			 var color4 = vec4(colorReflection.red, colorReflection.green, colorReflection.blue, colorReflection.alpha);
			 var colorScaling = scale(.2, color4); 
			 return {
				 red: color4[0], 
				 green: color4[1], 
				 blue: color4[2],
				 alpha: color4[3]
			 };
		 }
		 return {
			 red: 1,
			 blue: 1,
			 green: 1, 
			 alpha: 1
		 };
	 }
}

function getColorSphere(object, ray, depth, xDir, yDir) {
    var color = object.object.color; 
    var point = {
        x: ray.start.x + ray.vector.x * object.distance,
        y: ray.start.y + ray.vector.y * object.distance,
        z: ray.start.z + ray.vector.z * object.distance
    };

    var pointNormal = normalOf( equation3D(object.object.center, point) );
    var pointToLightNormal;
    var scaleFactor = 0.0;
    var castedShadow = 1;

    for(var i = 0; i < lights.length; i++) {
        pointToLightNormal = normalOf( equation3D(point, lights[i]) );
        scaleFactor = scaleFactor + Math.max(dot(pointToLightNormal,pointNormal), 0);
        var toLightRay = {
            start: point,
            vector: new Vector(pointToLightNormal[0], pointToLightNormal[1], pointToLightNormal[2])
        };
        var ray0 = pointToLightNormal;
        var len = normalize(ray0, 0);
        var temp = add(
            vec3(toLightRay.start.x, toLightRay.start.y, toLightRay.start.z),
            scale(.00001, len)
        );
			if(castedShadow != 1 && Math.max(dot(pointToLightNormal,pointNormal), 0) != 0){
				castedShadow = castedShadow / .65;
			}
        toLightRay.start.x = temp[0];
        toLightRay.start.y = temp[2];
        toLightRay.start.z = temp[2];
        
        var objectReturn = detectCollision(toLightRay, object.object);
        if(objectReturn === Infinity ||  objectReturn.object == object.object) {
				// Does not hit anything
        } else if(objectReturn.object != null) {
            castedShadow = castedShadow * .65;
        }
    }
	 
    scaleFactor = Math.max(scaleFactor, 0.50) * Math.min(castedShadow,1);

    var newColor = {
        red: color.red * scaleFactor,
        green: color.green * scaleFactor,
        blue: color.blue * scaleFactor,
        alpha: color.alpha
    };

    return newColor;
}

function equation3D(point1, point2) {
	return unitVec(point2.x - point1.x, point2.y - point1.y, point2.z - point1.z);
}

function sphereIntersection(obj, ray) {
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

    if((b*b - 4*a*c) > 0) {
        var t = (-b - Math.sqrt(b*b - 4*a*c)) / (2*a);
        return maxRayLength * t;
    }
}

function squareIntersection(obj, ray) {
	//var rayStart = vec3(ray.start.x,ray.start.y, ray.start.z);
	var raySx = ray.start.x;
	var raySy = ray.start.y;
	var raySz = ray.start.z;
	//var rayV = vec3(ray.vector.x, ray.vector.y, ray.vector.z);
	var rayVx = ray.vector.x;
	var rayVy = ray.vector.y;
	var rayVz = ray.vector.z;
	// console.log(obj.points);
	var vCrossNorm = triangleNormal(obj);
	// console.log(obj.points);
	var vCross = new Vector(vCrossNorm[0],vCrossNorm[1],vCrossNorm[2]);
	obj.normal = vCross;
	
	var denom = rayVx * vCross.x + rayVy * vCross.y + rayVz * vCross.z;
	if (denom == 0) {
		return ;
	}
	var time = (dot(subtract(obj.points[1], vec3(raySx, raySy, raySz)), vec3(vCross.x, vCross.y, vCross.z)))/denom;
	var point = add(vec3(raySx, raySy, raySz), scale(time, vec3(rayVx, rayVy, rayVz)));
	
	var xMin = Math.min(obj.points[0][0], obj.points[1][0], obj.points[2][0]) - .1;
	var xMax = Math.max(obj.points[0][0], obj.points[1][0], obj.points[2][0]) + .1;
	var yMin = Math.min(obj.points[0][1], obj.points[1][1], obj.points[2][1]) - .1;
	var yMax = Math.max(obj.points[0][1], obj.points[1][1], obj.points[2][1]) + .1;
	var zMin = Math.min(obj.points[0][2], obj.points[1][2], obj.points[2][2]) - .1;
	var zMax = Math.max(obj.points[0][2], obj.points[1][2], obj.points[2][2]) + .1;
	if(point[0] >= xMin && point[0] <= xMax && point[1] >= yMin && point[1] <= yMax && Math.floor(point[2]) >= zMin && Math.floor(point[2]) <= zMax) { 
		var diff = subtract(point, vec3(raySx, raySy, raySz));
		return Math.sqrt(dot(diff, diff));
	}
	
	return;
}