import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
import { OrbitControls } from './OrbitControls.js';

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a cube geometry
const geom = new THREE.SphereGeometry(0.5, 100, 100);

// Define colors for each vertex
const colors = [];
const positionAttribute = geom.attributes.position;

for (let i = 0; i < positionAttribute.count; i++) {
    const x = positionAttribute.getX(i) + 0.5;
    const y = positionAttribute.getY(i) + 0.5;
    const z = positionAttribute.getZ(i) + 0.5;
    const color = new THREE.Color(x, y, z);
    colors.push(color.r, color.g, color.b);
}

// Add colors to the geometry
geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

// Create a material with vertex colors
const mat = new THREE.MeshBasicMaterial({ vertexColors: true });

// Create the cube mesh
const cube = new THREE.Mesh(geom, mat);
scene.add(cube);

// Position the camera
camera.position.z = 1;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // An animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.minDistance = 1;
controls.maxDistance = 10;
controls.maxPolarAngle = Math.PI / 2;
controls.enableZoom = false;

// Function to handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Add event listener for window resize
window.addEventListener('resize', onWindowResize, false);

// Render loop
function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.001;
    cube.rotation.y += 0.001;
    renderer.render(scene, camera);

    controls.update();

}
animate();