import Material from "@/Material";
import Mesh from "@/Mesh";
import Vector3 from "@/Vector3";
import CubeGeometry from "@/geometries/CubeGeometry";
import setup from "@/setup";

setup(({ scene, camera }) => {
    const geo = new CubeGeometry(10, 10, 10);
    const mat = new Material(256, 0, 0, 255);
    const mesh = new Mesh(geo, mat);
    mesh.position.set(-2, -10, 29);
    scene.add(mesh);
    
    mesh.rotate(new Vector3(0, 1, 0), 30);
    mesh.rotate(new Vector3(1, 0, 0), 30);
    camera.position.set(0, 20, 0);
    camera.target.copy(new Vector3(0, -1, 1).norm());
});