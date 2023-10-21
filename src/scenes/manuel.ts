import Light from "@/Light";
import Mesh from "@/Mesh";
import Vector3 from "@/Vector3";
import OBJParser from "@/parsers/OBJParser";
import setup from "@/setup";

setup(async ({ scene, camera }) => {
    const donut = await OBJParser.parse("manuel.obj");
    const mesh = new Mesh(donut);
    scene.add(mesh);

    const light = new Light(2, 1, 0);
    light.position.set(4.0762, 5.9039, 1.0055);
    scene.addLight(light);

    camera.target.set(0, -1, 0);
    Mesh.applyRotation(new Vector3(1, 0, 0), -63.6, camera.target);
    Mesh.applyRotation(new Vector3(0, 1, 0), -32.3, camera.target);

    camera.near = 0.1;
    camera.position.set(5.04, 5.6445, -8.4267);
});