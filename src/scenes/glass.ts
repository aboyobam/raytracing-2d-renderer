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

    Material.all.wine.alpha = 0.8;

    const mat = Material.all.glass;
    mat.alpha = 0.25;
    mat.specular = 0.1;
    // mat.illusive = 0.2;
    camera.position.set(0, 6, -4);
    camera.lookAt(mesh.position);

    const camLight = new Light(5, 20, 2);
    camLight.position.copy(camera.position);
    scene.addLight(camLight)

    const floor = PlaneGeometry.asFloor(mesh, 3);
    scene.add(new Mesh(floor, Material.WHITE));

    const topLight = new Light(1.2, 5, 2);
    topLight.position.copy(mesh.position.add(new Vector3(-2, 5, 0)));
    scene.addLight(topLight);
});