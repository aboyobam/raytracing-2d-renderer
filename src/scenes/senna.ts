import Material from "@/Material";
import Mesh from "@/Mesh";
import OBJParser from "@/parsers/OBJParser";
import setup from "@/setup";

setup(async ({ scene, camera }) => {
    const geo = await OBJParser.parse("senna.obj");
    
    const mesh = new Mesh(geo, new Material());
    mesh.position.set(-0.5, 0.5, 6);
    Material.all['Mat.2'].alpha = 0.5;
    
    scene.add(mesh);
    camera.target.set(0, 0, 1);
});