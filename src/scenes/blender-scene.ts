import Light from "@/Light";
import Material from "@/Material";
import Mesh from "@/Mesh";
import Vector3 from "@/Vector3";
import OBJParser from "@/parsers/OBJParser";
import setup from "@/setup";

setup(async ({ scene, camera }) => {
    const geo = await OBJParser.parse("scene.obj");
    
    const mesh = new Mesh(geo, new Material(250, 0, 0, 150));
    // mesh.position.set(0, -2, 6);

    const lightTop = new Light(0.5, 15, 2);
    lightTop.position.copy(mesh.position.add(new Vector3(0, 5, 0)));
    scene.addLight(lightTop);

    const leftLight = new Light(0.5, 10, 1.1);
    leftLight.position.copy(mesh.position.add(new Vector3(-5, 0, 0)));
    scene.addLight(leftLight);

    camera.position.set(0, 12, -5);
    camera.lookAt(mesh.position);
    // const worldUp = new Vector3(0, 1, 0);
    // const side = camera.target.cross(worldUp).norm().cross(camera.target).norm();
    // camera.up.copy(side);

    scene.add(mesh);
});