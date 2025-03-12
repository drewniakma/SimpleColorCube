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
let currentSegments;

const CanvasWindow = document.getElementById('MainInteractionCanvas');




function init() {

// Set up the scene, camera, and renderer
scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(75, CanvasWindow.clientWidth / CanvasWindow.clientHeight, 0.1, 1000);
renderer = new THREE.WebGLRenderer({antialias: true }); //{alpha:true} - If wanted transparency
renderer.setSize(CanvasWindow.clientWidth, CanvasWindow.clientHeight);
CanvasWindow.appendChild(renderer.domElement);

// Position the camera
// camera.position.z = 7.5;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // An animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.25;

controls.minDistance = 7.5;
controls.maxDistance = 10;

controls.enablePan = false;
controls.screenSpacePanning = false;
// controls.enableZoom = false;


currentSegments = document.getElementById('segmentsRange').value;
updateSegmentedCube(currentSegments);

camera.position.set(4.33 ,4.33 ,4.33); // Almost exact value so the distance from the center is ~ 7,5
camera.position.set(3, 3, 3);




// THE CODE FOR COLOR PICKER


// Set up the raycaster
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Used for debugging
// Create a line geometry to visualize the ray
// const rayLineGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
// const rayLineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 5  });
// const rayLine = new THREE.Line(rayLineGeometry, rayLineMaterial);
// scene.add(rayLine);



// Function to update the tooltip
function updateTooltip(color) {
    const tooltip = document.getElementById('tooltip');
    const colorValue = document.getElementById('color-value');
    const colorPreview = document.getElementById('color-preview');

    // Convert THREE.Color to hex string
    const hexColor = `#${color.getHexString()}`;
    colorValue.innerText = hexColor;
    colorPreview.style.backgroundColor = hexColor;

    // Show the tooltip
    tooltip.style.display = 'block';
}

// Function to handle mouse move events
function onMouseMove(event) {

    // Get the bounding rectangle of the renderer's DOM element
    const BoundedCanvas = renderer.domElement.getBoundingClientRect();


    // Calculate mouse coordinates relative to the canvas element
    const canvasX = event.clientX - BoundedCanvas.left;
    const canvasY = event.clientY - BoundedCanvas.top;

    // Normalize the coordinates to the range [-1, 1]
    mouse.x = (canvasX / BoundedCanvas.width) * 2 - 1;
    mouse.y = -(canvasY / BoundedCanvas.height) * 2 + 1;
   
   
    raycaster.setFromCamera(mouse, camera);


    // Calculate objects intersecting the ray
    const intersects = raycaster.intersectObjects(segmentedCube.children, true);

    if (intersects.length > 0) {
        // Get the first intersected object
        const intersectedCube = intersects[0].object;

        // Get the color from the intersected cube
        const color = intersectedCube.geometry.attributes.color.array;
        const cubeColor = new THREE.Color(color[0], color[1], color[2]);

        // Update the tooltip with the color
        updateTooltip(cubeColor);

        // Position the tooltip near the mouse cursor
        const tooltip = document.getElementById('tooltip');
        tooltip.style.left = `${event.pageX + 10}px`;
        tooltip.style.top = `${event.pageY + 10}px`;
    } else {
        // Hide the tooltip if no cube is intersected
        document.getElementById('tooltip').style.display = 'none';
    }
}

// Add the mouse move event listener
window.addEventListener('mousemove', onMouseMove, false);







// Render loop
function animate() {
    requestAnimationFrame(animate);
    // segmentedCube.rotation.x += 0.001;
    // segmentedCube.rotation.y += 0.001;

    // console.log(mouse.x);

    renderer.render(scene, camera);
    controls.update();


    // console.log("x", mouse.x);
    // console.log("y", mouse.y);
    // console.log("Ray", raycaster);
   

}

animate();

// Function to handle window resize
function onWindowResize() {

    const newWidth = CanvasWindow.clientWidth;
    const newHeight = CanvasWindow.clientHeight;


    camera.aspect = CanvasWindow.clientWidth / CanvasWindow.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
}


window.addEventListener('resize', onWindowResize, false);



}

function updateSegmentedCube(segments) {
    if (segmentedCube) {
        // Traverse the group and dispose of each mesh's geometry and material
        segmentedCube.traverse((child) => {
            if (child.isMesh) {
                child.geometry.dispose();
                child.material.dispose();
            }
        });

        // Remove the group from the scene
        scene.remove(segmentedCube);

        // Clear the reference
        segmentedCube = null;
    }

    // Create a new segmented cube
    segmentedCube = createSegmentedCubeWithGapsandTransparency(segments, size, gap, transparentXRows, transparentYRows, transparentZRows);
    scene.add(segmentedCube);
}



// Function to create a segmented cube with gaps
function createSegmentedCubeWithGapsandTransparency(segments, size, gap, transparentXRows, transparentYRows, transparentZRows) {
    const segmentSize = (size - gap * (segments - 1)) / segments;
    const CubeGroup = new THREE.Group();

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
                const material = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: isTransparent, opacity: isTransparent ? 0 : 1.0});
                const cube = new THREE.Mesh(geom, material);

                // Calculate the position of each small cube with gaps
                cube.position.set(
                    -size / 2 + segmentSize / 2 + x * (segmentSize + gap),
                    -size / 2 + segmentSize / 2 + y * (segmentSize + gap),
                    -size / 2 + segmentSize / 2 + z * (segmentSize + gap)
                );

                CubeGroup.add(cube);
            }
        }
    }

    return CubeGroup;
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
    // console.log(sliderX, sliderY, sliderZ);


    if (parseInt(sliderX.value) >= sliderMaximum) {
        
        sliderX.value = sliderX.value - 1;
        setTransparentRows('x', sliderX.value);
        // console.log(sliderX.value)
    }

    if (parseInt(sliderY.value) >= sliderMaximum) {
        sliderY.value = sliderY.value - 1;
        
        setTransparentRows('y', sliderY.value);
        sliderY.value = sliderMaximum;
        // console.log(sliderY.value)
    }

    if (parseInt(sliderZ.value) >= sliderMaximum) {
        sliderZ.value = sliderZ.value - 1;
        
        setTransparentRows('z', sliderZ.value);
        sliderZ.value = sliderMaximum;
        // console.log(sliderZ.value)
    }

}




// Target positions and rotations for the camera
const targetPositions = [
    new THREE.Vector3(0, 0, 7.5),   // View 1: Front
    new THREE.Vector3(0, 7.5, 0.05),   // View 2: Top-right
    new THREE.Vector3(-7.5, 0, 0)   // View 3: Left side
];


// Animation variables
let isAnimating = false;
const animationDuration = 1; // Duration in seconds
let animationStartTime = 0;
let currentTargetIndex = 0;

// Function to animate the camera
function animateCamera(currentTime) {
    if (!isAnimating) return;

    const elapsedTime = (currentTime - animationStartTime)  / 1000 ;
    const t = Math.min(elapsedTime / animationDuration, 1); // Interpolation factor

    // Interpolate position and rotation
    camera.position.lerp(targetPositions[currentTargetIndex], t);

    // console.log(camera.rotation)    

   
    if (t < 0.5) {
        requestAnimationFrame(animateCamera);
    } else {
        isAnimating = false;
        // camera.rotation.set(0, 0, 0);
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


// THE CODE I MIGHT CHANGE IN THE FUTURE (AINT HAPPENING)
// Add an event listener for beforeunload
window.addEventListener('beforeunload', function (event) {
    // Perform any cleanup or save state here
    console.log('Page is about to reload or unload.');
    
});


// Add an event listener for unload
window.addEventListener('unload', function (event) {
    // Perform any final cleanup here
    console.log('Page has been unloaded.');
    const segmentsRangeOnLoad = document.getElementById('segmentsRange');
    const SegmentsOnLoad = parseInt(segmentsRangeOnLoad.value);
    updateSegmentedCube(SegmentsOnLoad);
    
});