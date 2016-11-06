var width = 500;
var height = 500;
var depth = 500;
var minX = 0;
var maxX = width;
var minY = 0;
var maxY = height;
var minZ = 02;
var maxZ = depth;

var frameBuffer = [];

var backgroundColor = vec4(0.0, 0.0, 0.0, 1.0);

function Vector(_x, _y, z) {
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

objects = [ // add objects here (needs atleas a color and points)
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

function render() {
    var view = camera.peripheral / 180 * Math.PI * 2;
    var heightWidthRatio = height / width;
    var halfWidth = Math.tan(fovRadians);
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