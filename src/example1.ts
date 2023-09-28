import Camera from "./lib/Camera";
import Material from "./lib/Material";
import Mesh from "./lib/Mesh";
import Renderer from "./lib/Renderer";
import Scene from "./lib/Scene";
import CubeGeometry from "./lib/geometries/CubeGeometry";

const scene = new Scene();
const renderer = new Renderer(1000, 1000, 0.5);
const camera = new Camera(45, renderer.width / renderer.height, 2);
document.body.appendChild(renderer.canvas);

const geo = new CubeGeometry(10, 10, 10);
const mat = new Material();
const mesh = new Mesh(geo, mat);
mesh.position.set(0, 0, 30);
scene.add(mesh);

// mesh.rotate(new Vector3(0, 1, 0), 45);
camera.target.set(0, 0, 1);
renderer.render(camera, scene);
renderer.draw();