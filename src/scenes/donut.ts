import Material from "@/Material";
import Mesh from "@/Mesh";
import PlaneGeometry from "@/geometries/PlaneGeometry";
import OBJParser from "@/parsers/OBJParser";
import setup from "@/setup";

setup(async ({ scene, camera }) => {
    const donut = await OBJParser.parse("donut.obj");
    const mesh = new Mesh(donut);
    scene.add(mesh);

    // const floorGeo = PlaneGeometry.asFloor(mesh, 1);
    // const flootMat = Material.RED;
    // scene.add(new Mesh(floorGeo, flootMat));
    
    camera.position.set(0, 1, -1.5);
    camera.lookAt(mesh.position);
});