import Material from "@/Material";
import Mesh from "@/Mesh";
import Vector3 from "@/Vector3";
import CubeGeometry from "@/geometries/CubeGeometry";
import setup from "@/setup";

setup(({ scene, camera, renderer }) => {
    const geo = new CubeGeometry(10, 10, 10);
    const mat = new Material();
    const mesh = new Mesh(geo, mat);
    mesh.position.set(0, 0, 30);
    scene.add(mesh);
    camera.target.set(0, 0, 1);
    
    setInterval(() => {
        mesh.rotate(new Vector3(0, 1, 0), 10);
        renderer.render(camera, scene);
    }, 200);
});