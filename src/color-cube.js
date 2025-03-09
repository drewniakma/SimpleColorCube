import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
import { OrbitControls } from './OrbitControls.js';

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


// Function to create a segmented cube with gaps
function createSegmentedCubeWithGaps(segments, size, gap, transparentXRows, transparentYRows, transparentZRows) {
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
                const material = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: isTransparent, opacity: isTransparent ? 0 : 1.0});
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
const size = 5; // Overall size of the segmented cube
const gap = 0.05; // Gap between segments
const transparentXRows = []; // Rows to make transparent in the X dimension
const transparentYRows = []; // Rows to make transparent in the Y dimension
const transparentZRows = []; // Rows to make transparent in the Z dimension
const segmentedCube = createSegmentedCubeWithGaps(segments, size, gap, transparentXRows, transparentYRows, transparentZRows);
scene.add(segmentedCube);


// Position the camera
camera.position.z = 7.5;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // An animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.minDistance = 1;
controls.maxDistance = 10;

controls.enableZoom = false;

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
    // cube.rotation.x += 0.001;
    // cube.rotation.y += 0.001;
    renderer.render(scene, camera);

    controls.update();

}

animate();