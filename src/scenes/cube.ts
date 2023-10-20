import Material from "@/Material";
import Mesh from "@/Mesh";
import Vector3 from "@/Vector3";
import CubeGeometry from "@/geometries/CubeGeometry";
import setup from "@/setup";

setup(({ scene, camera }) => {
    const geo = new CubeGeometry(10, 10, 10);
    const mat = new Material(255, 0, 0);
    const mesh = new Mesh(geo, mat);
    mesh.position.set(0, 0, 20);
    scene.add(mesh);
    
    mesh.rotate(new Vector3(0, 1, 0), 45);
    // mesh.rotate(new Vector3(1, 0, 0), 30);
    camera.position.set(0, 0, 0);
    camera.lookAt(mesh.position);
});