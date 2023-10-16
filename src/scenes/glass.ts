import Light from "@/Light";
import Material from "@/Material";
import Mesh from "@/Mesh";
import Vector3 from "@/Vector3";
import PlaneGeometry from "@/geometries/PlaneGeometry";
import OBJParser from "@/parsers/OBJParser";
import setup from "@/setup";

setup(async ({ scene, camera }) => {
    const geo = await OBJParser.parse("glass.obj");

    const mesh = new Mesh(geo);
    mesh.position.set(0, 0, 10);
    scene.add(mesh);

    const mat = Material.all.glass;
    mat.alpha = 0.5;
    // mat.specular = 0.08;
    // mat.illusive = 0.2;
    mesh.rotate(new Vector3(0, 1, 0), 30);
    // mesh.rotate(new Vector3(1, 0, 0), 30);
    camera.lookAt(mesh.position);
    camera.position.y = 2;

    const light = new Light(1, 20, 1.7);
    // light.position.x = -10;
    light.position.copy(mesh.position.add(new Vector3(-10, 1, 0)));
    scene.addLight(light);

    const floor = PlaneGeometry.asFloor(mesh, 1);
    // scene.add(new Mesh(floor, Material.GREEN));
});