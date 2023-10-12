import Material from "@/Material";
import Mesh from "@/Mesh";
import Vector3 from "@/Vector3";
import OBJParser from "@/parsers/OBJParser";
import setup from "@/setup";

setup(async ({ scene, camera }) => {
    const geo = await OBJParser.parse("porsche.obj");
    
    const mesh = new Mesh(geo, new Material());
    mesh.position.set(0, 0, 6);

    scene.add(mesh);
    camera.target.set(0, 0, 1);
});