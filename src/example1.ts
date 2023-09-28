import Camera from "./lib/Camera";
import Material from "./lib/Material";
import Mesh from "./lib/Mesh";
import Renderer from "./lib/Renderer";
import Scene from "./lib/Scene";
import Vector3 from "./lib/Vector3";
import CubeGeometry from "./lib/geometries/CubeGeometry";

const scene = new Scene();
const renderer = new Renderer(200, 160, 2);
const camera = new Camera(45, renderer.width / renderer.height, 2);
document.body.appendChild(renderer.canvas);

const geo = new CubeGeometry(10, 10, 10);
const mat = new Material();
const mesh = new Mesh(geo, mat);
mesh.position.set(0, 0, 30);
scene.add(mesh);
renderer.animate();

mesh.rotate(new Vector3(0, 1, 0), 45);
camera.target.set(0, 0, 1);
renderer.render(camera, scene);

setInterval(() => {
    mesh.rotate(new Vector3(0, 1, 0), 10);
    renderer.render(camera, scene);
}, 200);
