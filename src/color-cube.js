import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
import { OrbitControls } from './OrbitControls.js';

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


// Function to create a segmented cube with gaps
function createSegmentedCubeWithGaps(segments, size, gap) {
    const segmentSize = (size - gap * (segments - 1)) / segments;
    const group = new THREE.Group();

    for (let x = 0; x < segments; x++) {
        for (let y = 0; y < segments; y++) {
            for (let z = 0; z < segments; z++) {
                const geom = new THREE.BoxBufferGeometry(segmentSize, segmentSize, segmentSize);
                const material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
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

// Usage
const segments = 10; // Number of segments along each axis
const size = 3; // Overall size of the segmented cube
const gap = 0.05; // Gap between segments
const segmentedCube = createSegmentedCubeWithGaps(segments, size, gap);
scene.add(segmentedCube);


// Position the camera
camera.position.z = 5;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // An animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.minDistance = 1;
controls.maxDistance = 10;

controls.enableZoom = false;

// // Function to handle window resize
// function onWindowResize() {
//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();
//     renderer.setSize(window.innerWidth, window.innerHeight);
// }

// Add event listener for window resize
// window.addEventListener('resize', onWindowResize, false);

// Render loop
function animate() {
    requestAnimationFrame(animate);
    // cube.rotation.x += 0.001;
    // cube.rotation.y += 0.001;
    renderer.render(scene, camera);

    controls.update();

}

animate();