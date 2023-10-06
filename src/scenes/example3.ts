import Material from "@/Material";
import Mesh from "@/Mesh";
import Vector3 from "@/Vector3";
import OBJParser from "@/parsers/OBJParser";
import setup from "@/setup";

setup(async ({ scene, camera }) => {
    const geo = await OBJParser.parse("suzanne.obj");
    
    const mesh = new Mesh(geo, new Material(255, 0, 0));
    mesh.position.set(0, 0, 4);
    mesh.rotate(new Vector3(0, 1, 0), 150);

    scene.add(mesh);
    camera.target.set(0, 0, 1);
});