import Light from "@/Light";
import Material from "@/Material";
import Mesh from "@/Mesh";
import Vector3 from "@/Vector3";
import OBJParser from "@/parsers/OBJParser";
import setup from "@/setup";

setup(async ({ scene, camera }) => {
    const geo = await OBJParser.parse("porsche.obj");
    
    const mesh = new Mesh(geo, new Material());
    mesh.position.set(0, 0, 6);

    const lightTop = new Light(2, 10, 1.5);
    lightTop.position.copy(mesh.position.add(new Vector3(0, 5, 0)));
    // scene.addLight(lightTop);

    const leftLight = new Light(3, 10, 2);
    leftLight.position.copy(mesh.position.add(new Vector3(-5, 0, 0)));
    // scene.addLight(leftLight);    

    scene.add(mesh);
    camera.position.set(0, 3, 0);
    camera.lookAt(mesh.position);

    const camLight = new Light(3, 10, 2);
    camLight.position.copy(camera.position);
    scene.addLight(camLight);

    setTimeout(() => {
        
    }, 100);
});