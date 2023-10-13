import Light from "@/Light";
import Material from "@/Material";
import Mesh from "@/Mesh";
import Raytracer from "@/Raytracer";
import Vector3 from "@/Vector3";
import CubeGeometry from "@/geometries/CubeGeometry";
import setup from "@/setup";

setup(({ scene, camera }) => {
    const geo = new CubeGeometry(10, 10, 10);
    const mat = new Material(256, 0, 0, 100);
    const mesh1 = new Mesh(geo, mat);
    mesh1.position.set(-7, 0, 0);
    scene.add(mesh1);

    const mesh2 = new Mesh(new CubeGeometry(10, 10, 10), new Material(256, 0, 0, 100));
    mesh2.position.set(7, 0, 0);
    scene.add(mesh2);
    
    mesh1.rotate(new Vector3(0, 1, 0), 45);
    mesh2.rotate(new Vector3(0, 1, 0), 30);

    const light = new Light(10, 40, 2);
    light.position.set(-20, 0, 0);
    scene.addLight(light);

    camera.position.set(0, 0, -50);
    camera.lookAt(Vector3.ZERO);
});