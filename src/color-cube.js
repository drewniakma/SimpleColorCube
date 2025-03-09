import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
import { OrbitControls } from './OrbitControls.js';



// Usage

let scene, camera, renderer, segmentedCube;

// Number of segments along each axis
const size = 5; // Overall size of the segmented cube
const gap = 0.05; // Gap between segments
let transparentXRows = []; // Rows to make transparent in the X dimension
let transparentYRows = []; // Rows to make transparent in the Y dimension
let transparentZRows = []; // Rows to make transparent in the Z dimension
let currentSegments = 5;



function init() {

// Set up the scene, camera, and renderer
scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Position the camera
camera.position.z = 7.5;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // An animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.minDistance = 1;
controls.maxDistance = 10;

// controls.enableZoom = false;

updateSegmentedCube(currentSegments);


// Function to handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}


window.addEventListener('resize', onWindowResize, false);

// Render loop
function animate() {
    requestAnimationFrame(animate);
    // segmentedCube.rotation.x += 0.001;
    // segmentedCube.rotation.y += 0.001;
    renderer.render(scene, camera);
    controls.update();


}

animate();

}

function updateSegmentedCube(segments) {
    if (segmentedCube) {
        scene.remove(segmentedCube);
    }
    segmentedCube = createSegmentedCubeWithGapsandTransparency(segments, size, gap, transparentXRows, transparentYRows, transparentZRows);
    scene.add(segmentedCube);

}


// Function to create a segmented cube with gaps
function createSegmentedCubeWithGapsandTransparency(segments, size, gap, transparentXRows, transparentYRows, transparentZRows) {
    const segmentSize = (size - gap * (segments - 1)) / segments;
    const group = new THREE.Group();

    for (let x = 0; x < segments; x++) {
        for (let y = 0; y < segments; y++) {
            for (let z = 0; z < segments; z++) {

                const geom = new THREE.BoxBufferGeometry(segmentSize, segmentSize, segmentSize);


                // Calculate a single color for the entire small cube based on its position
                const color = new THREE.Color(
                    x / (segments - 1),
                    y / (segments - 1),
                    z / (segments - 1)
                );

                // Create an array to hold the color for each vertex
                const colors = [];
                for (let i = 0; i < geom.attributes.position.count; i++) {
                    colors.push(color.r, color.g, color.b);
                }

                // Add colors to the geometry
                geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

                const isTransparent =
                    transparentXRows.includes(x) ||
                    transparentYRows.includes(y) ||
                    transparentZRows.includes(z);

                // Use a material that supports vertex colors and transparency
                const material = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: isTransparent, opacity: isTransparent ? 0.04 : 1.0});
                const cube = new THREE.Mesh(geom, material);

                // Calculate the position of each small cube with gaps
                cube.position.set(
                    -size / 2 + segmentSize / 2 + x * (segmentSize + gap),
                    -size / 2 + segmentSize / 2 + y * (segmentSize + gap),
                    -size / 2 + segmentSize / 2 + z * (segmentSize + gap)
                );

                group.add(cube);
            }
        }
    }

    return group;
}


function setTransparentRows(axis, row) {
    if (axis === 'x') {
        transparentXRows = Array.from({ length: row }, (_, i) => i);
    } else if (axis === 'y') {
        transparentYRows = Array.from({ length: row }, (_, i) => i);
    } else if (axis === 'z') {
        transparentZRows = Array.from({ length: row }, (_, i) => i);
    }
    updateSegmentedCube(currentSegments);
}


function updateSliderRanges(segmentsSettingTheRange) {

    const sliderX = document.getElementById('x-dimension');
    const sliderY = document.getElementById('y-dimension');
    const sliderZ = document.getElementById('z-dimension');
    const sliderMaximum = segmentsSettingTheRange;

    

   // Set the max attribute for each slider
   sliderX.setAttribute('max', sliderMaximum);
   sliderY.setAttribute('max', sliderMaximum);
   sliderZ.setAttribute('max', sliderMaximum);

   // Log the slider elements to verify the max attribute
   console.log(sliderX, sliderY, sliderZ);


    if (parseInt(sliderX.value) >= sliderMaximum) {
        
        sliderX.value = sliderX.value - 1;
        setTransparentRows('x', sliderX.value);
        console.log(sliderX.value)
    }

    if (parseInt(sliderY.value) >= sliderMaximum) {
        sliderY.value = sliderY.value - 1;
        
        setTransparentRows('y', sliderY.value);
        sliderY.value = sliderMaximum;
        console.log(sliderY.value)
    }

    if (parseInt(sliderZ.value) >= sliderMaximum) {
        sliderZ.value = sliderZ.value - 1;
        
        setTransparentRows('z', sliderZ.value);
        sliderZ.value = sliderMaximum;
        console.log(sliderZ.value)
    }

}




// Target positions and rotations for the camera
const targetPositions = [
    new THREE.Vector3(0, 0, 7.5),   // View 1: Front
    new THREE.Vector3(0, 7.5, 0.01),   // View 2: Top-right
    new THREE.Vector3(-7.5, 0, 0)   // View 3: Left side
];


// Animation variables
let isAnimating = false;
const animationDuration = 5; // Duration in seconds
let animationStartTime = 0;
let currentTargetIndex = 0;

// Function to animate the camera
function animateCamera(currentTime) {
    if (!isAnimating) return;

    const elapsedTime = (currentTime - animationStartTime)  / 1000 ;
    const t = Math.min(elapsedTime / animationDuration, 1); // Interpolation factor

    // Interpolate position and rotation
    camera.position.lerp(targetPositions[currentTargetIndex], t);

    console.log(camera.rotation)    

   
    if (t < 0.1) {
        requestAnimationFrame(animateCamera);
    } else {
        isAnimating = false;
        camera.rotation.set(0, 0, 0);
    }
}

// Function to start the camera animation
function moveCameraToView(index) {
    if (isAnimating) return;
    currentTargetIndex = index;
    isAnimating = true;
    animationStartTime = performance.now();
    requestAnimationFrame(animateCamera);
}









init();

// Event listener for segment changes
document.getElementById('segmentsRange').addEventListener('input', function(event) {
    currentSegments = parseInt(event.target.value);
    updateSegmentedCube(currentSegments);
    updateSliderRanges(currentSegments);
});

document.getElementById('x-dimension').addEventListener('input', function(event) {
    const row = parseInt(event.target.value);
    setTransparentRows('x', row);
});

document.getElementById('y-dimension').addEventListener('input', function(event) {
    const row = parseInt(event.target.value);
    setTransparentRows('y', row);
});

document.getElementById('z-dimension').addEventListener('input', function(event) {
    const row = parseInt(event.target.value);
    setTransparentRows('z', row);
});


// Add event listeners to the buttons
document.getElementById('CameraFront').addEventListener('click', () => moveCameraToView(0));
document.getElementById('CameraTop').addEventListener('click', () => moveCameraToView(1));
document.getElementById('CameraSide').addEventListener('click', () => moveCameraToView(2));
