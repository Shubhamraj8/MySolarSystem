import * as THREE from './three.module.js';
import { OrbitControls } from './OrbitControls.js';

// UI state
let isPaused = false;
let darkMode = true;

// Orbit speed controls
const orbitSpeeds = {
  mercury: 1, venus: 1, earth: 1, mars: 1,
  jupiter: 1, saturn: 1, uranus: 1, neptune: 1
};

// Scene and background
const scene = new THREE.Scene();
const loader = new THREE.TextureLoader();
scene.background = loader.load('./image/stars.jpg');

// Camera setup
const camera = new THREE.PerspectiveCamera(
  75, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.set(0, 30, 120);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 1));
const sunLight = new THREE.PointLight(0xffffff, 2, 500);
scene.add(sunLight);

// Create a planet with orbit
function createPlanet(name, size, distance) {
  const texture = loader.load(`./image/${name}.jpg`);
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(size, 32, 32),
    new THREE.MeshStandardMaterial({ map: texture })
  );
  const orbit = new THREE.Object3D();
  mesh.position.set(distance, 0, 0);
  orbit.add(mesh);
  scene.add(orbit);
  return { mesh, orbit };
}

// Sun
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(16, 32, 32),
  new THREE.MeshBasicMaterial({ map: loader.load('./image/sun.jpg') })
);
scene.add(sun);

// Planets
const pMercury = createPlanet('mercury', 1.5, 20);
const pVenus   = createPlanet('venus',   3,   30);
const pEarth   = createPlanet('earth',   4,   40);
const pMars    = createPlanet('mars',    3,   60);
const pJupiter = createPlanet('jupiter', 8,   90);
const pSaturn  = createPlanet('saturn',  7,  120);

//For Saturn Ring 

const saturnRingTexture = loader.load('../image/saturn_ring.png');
const saturnRingGeometry = new THREE.RingGeometry(8, 12, 64);
const saturnRingMaterial = new THREE.MeshBasicMaterial({
  map: saturnRingTexture,
  side: THREE.DoubleSide,
  transparent: true,
});
const saturnRing = new THREE.Mesh(saturnRingGeometry, saturnRingMaterial);
saturnRing.rotation.x = Math.PI / 2;
pSaturn.mesh.add(saturnRing);

const pUranus  = createPlanet('uranus',  5,  150);
const pNeptune = createPlanet('neptune', 5,  180);

// Raycaster and mouse
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('mousemove', (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

// Labels
function createLabel(text) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.font = '24px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText(text, 0, 24);

  const texture = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture }));
  sprite.visible = false;
  scene.add(sprite);
  return sprite;
}

const labels = {
  mercury: createLabel('Mercury'),
  venus: createLabel('Venus'),
  earth: createLabel('Earth'),
  mars: createLabel('Mars'),
  jupiter: createLabel('Jupiter'),
  saturn: createLabel('Saturn'),
  uranus: createLabel('Uranus'),
  neptune: createLabel('Neptune')
};

// Pause/Resume button
document.getElementById('pauseBtn').addEventListener('click', () => {
  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
});

// Theme toggle button
document.getElementById('themeBtn').addEventListener('click', () => {
  darkMode = !darkMode;
  themeBtn.textContent = darkMode ? 'Dark' : 'Light';
  scene.background = loader.load(`./image/${darkMode ? 'stars.jpg' : 'day.jpg'}`);
});

// Orbit speed sliders
for (const planet in orbitSpeeds) {
  document.getElementById(`${planet}Speed`).addEventListener('input', (e) => {
    orbitSpeeds[planet] = parseFloat(e.target.value);
  });
}

// Zoom to planet on click
window.addEventListener('click', () => {
  raycaster.setFromCamera(mouse, camera);
  const allPlanets = [
    pMercury.mesh, pVenus.mesh, pEarth.mesh, pMars.mesh,
    pJupiter.mesh, pSaturn.mesh, pUranus.mesh, pNeptune.mesh
  ];
  const hit = allPlanets.map(p => raycaster.intersectObject(p)[0]).filter(Boolean)[0];
  if (hit) {
    gsap.to(camera.position, {
      x: hit.object.position.x * 1.5,
      y: hit.object.position.y + 10,
      z: hit.object.position.z * 1.5,
      duration: 1
    });
  }
});

// Resize handling
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animate everything
function animate() {
  requestAnimationFrame(animate);

  if (!isPaused) {
    sun.rotation.y += 0.001;

    const planets = [
      [pMercury, 'mercury', 0.03, 0.02],
      [pVenus,   'venus',   0.01, 0.007],
      [pEarth,   'earth',   0.02, 0.01],
      [pMars,    'mars',    0.015, 0.005],
      [pJupiter, 'jupiter', 0.04, 0.003],
      [pSaturn,  'saturn',  0.03, 0.002],
      [pUranus,  'uranus',  0.025, 0.0015],
      [pNeptune, 'neptune', 0.02, 0.001]
    ];

    planets.forEach(([planet, name, spin, orbitSpeed]) => {
      planet.mesh.rotation.y += spin;
      planet.orbit.rotation.y += orbitSpeed * orbitSpeeds[name];
    });
  }

  controls.update();

  // Show/hide labels
  raycaster.setFromCamera(mouse, camera);
  const planetMeshes = {
    mercury: pMercury.mesh, venus: pVenus.mesh, earth: pEarth.mesh, mars: pMars.mesh,
    jupiter: pJupiter.mesh, saturn: pSaturn.mesh, uranus: pUranus.mesh, neptune: pNeptune.mesh
  };

  for (const key in labels) {
    const mesh = planetMeshes[key];
    const intersect = raycaster.intersectObject(mesh)[0];
    if (intersect) {
      labels[key].visible = true;
      labels[key].position.copy(mesh.position).add(new THREE.Vector3(0, mesh.geometry.parameters.radius + 4, 0));
    } else {
      labels[key].visible = false;
    }
  }

  renderer.render(scene, camera);
}

animate();
