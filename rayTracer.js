var width = 500;
var height = 500;
var depth = 500;
var minX = -width / 2;
var maxX = width / 2;
var minY = -height / 2;
var maxY = height / 2;
var minZ = -depth / 2;
var maxZ = depth / 2;

var camera = {
    location: {
        x: 0,
        y: 0,
        z: 0
    },
    peripheral: 60,
    vec: {
        x: 0,
        y: 0,
        z: 1
    }
};

var lights = [ // can add as many lights as possible
    {
        x: maxX,
        y: maxY,
        z: maxZ
    }
];

objects = [ // add objects here
    {
        
    }
];

function render() {

}

function trace(ray, depth) {

}

// intersectScene
function detectCollision(ray) {

}

// surface
function getColor(ray, object, point, n, depth) {

}