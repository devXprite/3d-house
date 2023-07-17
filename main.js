import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'stats.js';
import * as dat from 'dat.gui';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls(camera, renderer.domElement)
const textureLoader = new THREE.TextureLoader();
const stats = new Stats();
const gui = new dat.GUI();

camera.position.set(0, 5, 20)
controls.enableDamping = true;
document.body.style.margin = 0;
document.body.appendChild(renderer.domElement);
document.body.appendChild(stats.dom);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
gui.width = 300;

const doorTexture = textureLoader.load('./textures/door/color.jpg');
const doorAlphaTexture = textureLoader.load('./textures/door/alpha.jpg');
const doorNormalTexture = textureLoader.load('./textures/door/normal.jpg');

const bricksTexture = textureLoader.load('./textures/bricks/color.jpg');
const bricksNormalTexture = textureLoader.load('./textures/bricks/normal.jpg');

const floorTexture = textureLoader.load('./textures/floor/floor.jpg');
const floorNormalTexture = textureLoader.load('./textures/floor/floorMap.jpg');
floorTexture.repeat.set(4, 4);
floorNormalTexture.repeat.set(4, 4);
floorTexture.wrapS = THREE.RepeatWrapping;
floorTexture.wrapT = THREE.RepeatWrapping;
floorNormalTexture.wrapS = THREE.RepeatWrapping;
floorNormalTexture.wrapT = THREE.RepeatWrapping;


const gridHelper = new THREE.GridHelper(30, 50, 50);
scene.add(gridHelper);
gridHelper.visible = false;
gui.add(gridHelper, 'visible').name('Grid Helper');

const ambitionLight = new THREE.AmbientLight(0xb9d5ff, 0.4);
scene.add(ambitionLight);
gui.add(ambitionLight, 'intensity').min(0).max(1).step(0.01).name('Ambient Light');


const house = new THREE.Group();
scene.add(house);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 30),
  new THREE.MeshStandardMaterial({
    color: 0xa9c388,
    map: floorTexture,
    normalMap: floorNormalTexture,
    side: THREE.DoubleSide
  })
)

floor.rotation.x = Math.PI * -0.5;
floor.position.y = -0.01;
floor.receiveShadow = true;
scene.add(floor)
gui.add(floor, 'receiveShadow').name('Enable Shadow');



const walls = new THREE.Mesh(
  new THREE.BoxGeometry(6, 4, 6),
  new THREE.MeshStandardMaterial({
    roughness: 0.33,
    map: bricksTexture,
    normalMap: bricksNormalTexture,
  })
)
house.add(walls);
walls.castShadow = true;
walls.position.y = walls.geometry.parameters.height * 0.5;
gui.add(walls.material, 'roughness').min(0).max(1).step(0.01).name('Walls Roughness');



const roof = new THREE.Mesh(
  new THREE.ConeGeometry(
    walls.geometry.parameters.width * 0.85,
    walls.geometry.parameters.height * 0.3,
    4
  ),

  new THREE.MeshStandardMaterial({
    color: 0xb35f45,
    roughness: 0.45,
    map: bricksTexture,
    normalMap: bricksNormalTexture,
  })
);
house.add(roof);
roof.position.y = walls.geometry.parameters.height + roof.geometry.parameters.height * 0.5;
roof.rotation.y = Math.PI * 0.25;
roof.castShadow = true;
gui.add(roof.material, 'roughness').min(0).max(1).step(0.01).name('Roof Roughness');


const door = new THREE.Mesh(
  new THREE.PlaneGeometry(3, 3, 10, 10),
  new THREE.MeshStandardMaterial({
    // color: '#00ff00'
    roughness: 0.1,
    map: doorTexture,
    alphaMap: doorAlphaTexture,
    transparent: true,
    normalMap: doorNormalTexture,
  })
)
door.position.z = (walls.geometry.parameters.width * 0.5) + 0.01;
door.position.y = door.geometry.parameters.height * 0.5;
house.add(door);

const doorLight = new THREE.Mesh(
  new THREE.SphereGeometry(0.1, 10, 10),
  new THREE.MeshStandardMaterial({
    emissive: 0xffffee,
    emissiveIntensity: 1,
    color: 0xffffee,
    roughness: 1
  })
)
doorLight.position.set(0, 3.9, 3.25);
doorLight.castShadow = true;
house.add(doorLight);

const doorPointLight = new THREE.PointLight(0xffffff, 1, 20, 2);
doorPointLight.position.copy(doorLight.position);
doorPointLight.castShadow = true;
house.add(doorPointLight);

gui.add(doorPointLight, 'intensity').min(0).max(2).step(0.01).name('Door Light Intensity');
gui.add(doorPointLight.position, 'y').min(0).max(10).step(0.01).name('Door Light Y')
  .onChange(() => { doorLight.position.y = doorPointLight.position.y; });

gui.add(doorPointLight.position, 'z').min(0).max(10).step(0.01).name('Door Light Z')
  .onChange(() => { doorLight.position.z = doorPointLight.position.z });


const bushesGroup = new THREE.Group();
const bushGeometry = new THREE.SphereGeometry(0.8, 6, 6);
const bushMaterial = new THREE.MeshStandardMaterial({
  color: 0x89c854
})
scene.add(bushesGroup);

const bushes = [
  { x: 3, z: 4.5, scale: 1 },
  { x: 3.85, z: 4.5, scale: 0.4 },
  { x: 6, z: 7.5, scale: 1 },

  { x: -5, z: 5, scale: 1 },
  { x: -7.5, z: -6.5, scale: 1 },
  { x: -3.85, z: -6.5, scale: 0.4 },
]

bushes.forEach((bush) => {
  const bushMesh = new THREE.Mesh(bushGeometry, bushMaterial);
  bushMesh.position.set(bush.x, 0.4 * bush.scale, bush.z);
  bushMesh.scale.set(bush.scale, bush.scale, bush.scale);
  bushMesh.castShadow = true;
  bushesGroup.add(bushMesh);
})



const graves = new THREE.Group();
scene.add(graves);

const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2);
const graveMaterial = new THREE.MeshStandardMaterial({
  color: 0xb2b6b1,
})

for (let i = 0; i < 20; i++) {
  const angle = Math.random() * Math.PI * 2;
  const radius = 5 + Math.random() * 7;
  const x = Math.sin(angle) * radius;
  const z = Math.cos(angle) * radius;

  const grave = new THREE.Mesh(graveGeometry, graveMaterial);
  grave.position.set(x, 0.4, z);
  grave.rotation.z = (Math.random() - 0.5) * 0.4;
  grave.rotation.y = (Math.random() - 0.5) * 2;
  grave.castShadow = true;

  graves.add(grave);
}

const streetLightOptions = {
  height: 2.5,
  intensity: 1,
  distance: 25,
  decay: 2,
  penumbra: 0.5,
}


const createStreetLight = (x, z, color) => {

  const { height, intensity, decay, distance } = streetLightOptions;

  const streetLight = new THREE.Group();
  streetLight.position.set(x, height, z);

  const lightPoll = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.1, height * 2),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 })
  )

  streetLight.add(lightPoll);

  const lightBulb = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.5, 0.5, 10),
    new THREE.MeshBasicMaterial({
      color: color
    })
  )

  lightBulb.position.y = height;
  lightBulb.rotation.y = Math.PI * 0.25;
  streetLight.add(lightBulb);

  const lightBulbPointLight = new THREE.PointLight(color, intensity, distance, decay)
  lightBulbPointLight.position.y = height;
  lightBulbPointLight.castShadow = true;
  streetLight.add(lightBulbPointLight);

  return streetLight;
}

const streetLight1 = createStreetLight(-10, 10, 0x00ffff);
scene.add(streetLight1);

const streetLight2 = createStreetLight(10, 10, 0xff0000);
scene.add(streetLight2);

const streetLight3 = createStreetLight(10, -10, 0x00ff00);
scene.add(streetLight3);

const streetLight4 = createStreetLight(-10, -10, 0xff00ff);
scene.add(streetLight4);


gui.add(streetLightOptions, 'intensity').min(0.1).max(2).step(0.01).name('Poll Light Intensity')
  .onChange(() => {
    streetLight1.children[2].intensity = streetLightOptions.intensity;
    streetLight2.children[2].intensity = streetLightOptions.intensity;
    streetLight3.children[2].intensity = streetLightOptions.intensity;
    streetLight4.children[2].intensity = streetLightOptions.intensity;
  });


gui.add(streetLightOptions, 'decay').min(0.1).max(3).step(0.01).name('Poll Light Decay')
  .onChange(() => {
    streetLight1.children[2].decay = streetLightOptions.decay;
    streetLight2.children[2].decay = streetLightOptions.decay;
    streetLight3.children[2].decay = streetLightOptions.decay;
    streetLight4.children[2].decay = streetLightOptions.decay;
  });


gui.add(streetLightOptions, 'distance').min(0.1).max(50).step(0.01).name('Poll Light Distance')
  .onChange(() => {
    streetLight1.children[2].distance = streetLightOptions.distance;
    streetLight2.children[2].distance = streetLightOptions.distance;
    streetLight3.children[2].distance = streetLightOptions.distance;
    streetLight4.children[2].distance = streetLightOptions.distance;
  });



const tick = () => {
  stats.begin();
  requestAnimationFrame(tick);
  controls.update();
  renderer.render(scene, camera)
  stats.end();
}
tick()

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
})


