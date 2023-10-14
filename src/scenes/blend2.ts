import Material from "@/Material";
import Mesh from "@/Mesh";
import Vector3 from "@/Vector3";
import CubeGeometry from "@/geometries/CubeGeometry";
import PlaneGeometry from "@/geometries/PlaneGeometry";
import OBJParser from "@/parsers/OBJParser";
import setup from "@/setup";

setup(async ({ scene, camera }) => {
    const geo = await OBJParser.parse("blend2.obj");
    
    const mesh = new Mesh(geo, Material.NONE);

    camera.position.set(0, 5, -20);
    camera.lookAt(mesh.position);

    scene.add(mesh);

    Material.all.mirror.specular = 0.7;
});