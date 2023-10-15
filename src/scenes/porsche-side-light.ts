import Light from "@/Light";
import Material from "@/Material";
import Mesh from "@/Mesh";
import Vector3 from "@/Vector3";
import PlaneGeometry from "@/geometries/PlaneGeometry";
import OBJParser from "@/parsers/OBJParser";
import setup from "@/setup";

setup(async ({ scene, camera }) => {
    const porsche = await OBJParser.parse("porsche.obj");
    
    const mesh = new Mesh(porsche, new Material());
    mesh.position.set(0, 0, 6);

    scene.add(mesh);
    camera.position.set(0, 3, 0);
    camera.lookAt(mesh.position);

    const floor = PlaneGeometry.asFloor(mesh, 1);
    scene.add(new Mesh(floor, Material.WHITE));

    /*for (let i = 1; i <= floor.vertecies.length; i++) {
        const edge = [floor.vertecies[i - 1], floor.vertecies[i % floor.vertecies.length]] as const;
        const mid = Vector3.midpoint(...edge);
        const light = new Light(1.5, 10, 1.5);
        light.position.copy(mid.add(new Vector3(0, 4, 0)));
        scene.addLight(light);
    }*/
});